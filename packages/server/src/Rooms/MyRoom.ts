import http from "http";
import { Room, Client } from "colyseus";

export class MyRoom extends Room {
    // (optional) Validate client auth token before joining/creating the room
    static async onAuth(token: Client, request: http.IncomingMessage) {}

    // When room is initialized
    onCreate(options: any) {}

    // When client successfully join the room
    onJoin(client: Client, options: any, auth: any) {}

    // When a client leaves the room
    onLeave(client: Client, consented: boolean) {}

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {}
}
