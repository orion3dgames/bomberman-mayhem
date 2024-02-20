import { Room, Client, Delayed, Protocol, ServerError } from "colyseus";
import { GameState, Player } from "./GameState";
import gameConfig from "../game.config";
import Logger from "../../../shared/Utils/Logger";

import { generateUserName, generateRoomId } from "../Utils/Utils";

export class GameRoom extends Room<GameState> {
    /** Current timeout skip reference */
    public inactivityTimeoutRef?: Delayed;
    public delayedRoundStartRef?: Delayed;
    public delayedRoomDeleteRef?: Delayed;
    public maxClients: number = 4;

    public autoDispose = true;
    private LOBBY_CHANNEL = "GameRoom";

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

        console.log("Creating Room", this.roomId);

        //this.setPrivate();
        this.setState(new GameState({}));
        this.clock.start();

        //Send ping messages to all clients
        this.clock.setInterval(() => {
            this.broadcast("ping");
        }, gameConfig.pingInterval);

        // Client message listeners:
        this.onMessage("START_GAME_REQUESTED", (client, state: boolean) => {
            this.broadcast("START_GAME", true);
        });
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

        this.state.players.set(
            client.sessionId,
            new Player({
                sessionId: client.sessionId,
                displayName: client.auth.name,
                admin: this.state.players.size == 0,
            })
        );
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
}
