import { Room, Client, Delayed, Protocol, ServerError } from "colyseus";
import { GameState } from "./GameState";
import gameConfig from "../game.config";
import Logger from "../../../shared/Utils/Logger";
import { ServerMsg } from "../../../shared/types";
import { MapHelper } from "../../../shared/MapHelper";

import { generateRoomId } from "../Utils/Utils";
import { Player } from "./Entities/Player";

export class GameRoom extends Room<GameState> {
    /** Current timeout skip reference */
    public inactivityTimeoutRef?: Delayed;
    public delayedRoundStartRef?: Delayed;
    public delayedRoomDeleteRef?: Delayed;
    public maxClients: number = 4;

    public autoDispose = true;
    private LOBBY_CHANNEL = "GameRoom";

    private mapHelper: MapHelper;

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

        //this.setPrivate();
        this.setState(new GameState({}));
        this.clock.start();

        // set metadata
        this.state.map = e.map;

        //
        this.mapHelper = new MapHelper(e.map);

        //
        console.log("Creating Room", this.roomId, this.state.map);

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
            Object.values(this._reconnections)[0].reject();
        }

        return auth;
    }

    onJoin(client: Client) {
        this.log(`Join`, client);

        // find spawnpoint
        let spawnpoint = this.mapHelper.setSpawnPoint(client.sessionId);
        console.log(spawnpoint);

        let player = new Player({
            sessionId: client.sessionId,
            name: client.auth.name,
            admin: this.state.players.size == 0,
            x: spawnpoint.position.x,
            y: spawnpoint.position.y,
            z: spawnpoint.position.z,
        });

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

            if (type === ServerMsg.START_GAME_REQUESTED) {
                this.lock();
                this.broadcast(ServerMsg.START_GAME, true);
            }

            if (type === ServerMsg.PLAYER_MOVE) {
                console.log(ServerMsg[ServerMsg.PLAYER_MOVE], data);
                playerState.move(data);
            }
        });
    }
}
