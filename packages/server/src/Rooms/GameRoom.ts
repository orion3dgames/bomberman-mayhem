import { Room, Client, Delayed, Protocol, ServerError, updateLobby, generateId } from "colyseus";
import { GameState } from "./GameState";
import gameConfig from "../game.config";
import Logger from "../../../shared/Utils/Logger";
import { ServerMsg } from "../../../shared/types";
import { MapHelper } from "../../../shared/MapHelper";

import { generateRoomId } from "../Utils/Utils";
import { Player } from "./Entities/Player";
import { Bomb } from "./Entities/Bomb";

export class GameRoom extends Room<GameState> {
    /** Current timeout skip reference */
    public inactivityTimeoutRef?: Delayed;
    public delayedRoundStartRef?: Delayed;
    public delayedRoomDeleteRef?: Delayed;
    public maxClients: number = 4;

    public autoDispose = true;
    private LOBBY_CHANNEL = "GameRoom";

    public mapHelper: MapHelper;

    private log(msg: string, client?: Client | string) {
        if (process.env.ROOM_LOG_DISABLE == "true") return;

        Logger.info(`Room ${this.roomId} ${client ? "Client " + ((<any>client).sessionId || client) : ""}`, msg);
    }

    private async registerRoomId(): Promise<string> {
        const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL);
        let id;
        do id = generateRoomId();
        while (currentIds.includes(id));
        await this.presence.sadd(this.LOBBY_CHANNEL, id);
        return id;
    }

    async onCreate(e) {
        if (!e.roomId) {
            this.roomId = await this.registerRoomId();
        } else {
            this.roomId = e.roomId;
        }

        this.setState(new GameState({}));
        this.clock.start();

        // set map
        this.setMetadata({
            map: e.map,
        }).then(() => {
            this.state.map = e.map;
            this.changeMap(e.map);
        });

        //
        this.mapHelper = new MapHelper(this.metadata.map);
        console.log("Creating Room", this.roomId, e.map);

        //Send ping messages to all clients
        //Set a simulation interval that can change the state of the game
        this.setSimulationInterval((dt) => {
            this.state.update(dt);
        }, 100);

        //
        this.processMessages();
    }

    onAuth(client: Client, auth) {
        //No more space at table
        if (this.state.players.size == gameConfig.maxClients) throw new ServerError(gameConfig.roomFullCode, "room is full");

        //We have to kick the oldest disconnected player to make space for new player
        if (this.state.players.size + Object.keys(this._reconnections).length == gameConfig.maxClients) {
            //Object.values(this._reconnections)[0].reject();
        }

        return auth;
    }

    onJoin(client: Client) {
        this.log(`Join`, client);

        // find spawnpoint
        let spawnpoint = this.mapHelper.setSpawnPoint(client.sessionId);

        let player = new Player(
            {
                sessionId: client.sessionId,
                name: client.auth.name,
                admin: this.state.players.size == 0,
                col: spawnpoint.col,
                row: spawnpoint.row,
            },
            this
        );

        this.state.players.set(client.sessionId, player);
    }

    async onLeave(client: Client, consented: boolean) {
        console.log(`Leave: ` + consented, client.sessionId);

        // flag client as inactive for other users
        //this.state.players.get(client.sessionId).disconnected = true;

        this.deletePlayer(client.sessionId);

        //
        client.leave();
        /*
        try {
            if (consented) {
                throw new Error("consented leave");
            }

            // allow disconnected client to reconnect into this room until 20 seconds
            await this.allowReconnection(client, 20);

            // client returned! let's re-activate it.
            this.state.players.get(client.sessionId).disconnected = false;
        } catch (e) {
            // 20 seconds expired. let's remove the client.
            this.state.players.delete(client.sessionId);
        }*/
    }

    onDispose() {
        this.presence.srem(this.LOBBY_CHANNEL, this.roomId);
        this.log(`Disposing`);
    }

    private deletePlayer(id: string) {
        const player = this.state.players.get(id);

        //If deleted player reconnects, they should not be ready
        player.ready = false;

        this.state.players.delete(id);

        //If deleted player was admin, assign random other player as admin
        if (player.admin && this.state.players.size > 0) {
            player.admin = false;

            const a = [...this.state.players.values()];
            a[Math.floor(Math.random() * a.length)].admin = true;
        }
    }

    processMessages() {
        // Client message listeners:
        this.onMessage("*", (client, type, data) => {
            ////////////////////////////////////
            ////////// PLAYER EVENTS ///////////
            ////////////////////////////////////
            const playerState: Player = this.state.players.get(client.sessionId) as Player;
            if (!playerState) {
                return false;
            }

            if (type === ServerMsg.START_MAP_UPDATE) {
                this.changeMap(data.key);
            }

            if (type === ServerMsg.START_GAME_REQUESTED) {
                // lock the room
                this.lock();

                // generate level
                this.generateLevel();

                // send all players instructions to start
                this.broadcast(ServerMsg.START_GAME, true);
            }

            if (type === ServerMsg.PLAYER_MOVE) {
                console.log(ServerMsg[ServerMsg.PLAYER_MOVE], data);
                playerState.move(data);
            }

            if (type === ServerMsg.PLACE_BOMB) {
                if (playerState.bombs > 0) {
                    console.log(ServerMsg[ServerMsg.PLACE_BOMB], data);
                    let bomb = new Bomb(
                        {
                            sessionId: generateId(),
                            owner: playerState.sessionId,
                            col: playerState.col,
                            row: playerState.row,
                            size: playerState.explosion_size,
                        },
                        this
                    );

                    this.state.bombs.set(bomb.sessionId, bomb);

                    playerState.bombs--;
                }
            }
        });
    }

    public generateLevel() {
        this.mapHelper.generateServerMap(this);
    }

    public changeMap(key) {
        this.setMetadata({
            map: key,
        }).then(() => {
            this.state.map = key;
            this.mapHelper = new MapHelper(this.metadata.map);
            updateLobby(this);
        });
    }
}
