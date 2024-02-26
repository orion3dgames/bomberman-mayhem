import { Schema, type } from "@colyseus/schema";
import { GameRoom } from "../GameRoom";
import { Schema, type } from "@colyseus/schema";
import { Entity } from "./Entity";

export class Bomb extends Entity {
    public room: GameRoom;

    constructor(args, room: GameRoom) {
        super(args, room);

        this.room = room;

        // add spawn data
        Object.assign(this, args);

        this.type = "bomb";
    }
}
