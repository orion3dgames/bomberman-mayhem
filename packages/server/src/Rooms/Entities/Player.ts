import { Schema, type } from "@colyseus/schema";
import { Entity } from "./Entity";
import { GameRoom } from "../GameRoom";

export class Player extends Entity {
    @type("string") name: string;
    @type("boolean") ready = false;
    @type("boolean") autoReady = false;
    @type("boolean") disconnected = false;
    @type("boolean") admin: boolean = false;
    @type("int16") sequence: number = 0;

    public room: GameRoom;

    constructor(args, room: GameRoom) {
        super(args, room);

        this.type = "player";
    }

    move(playerInput) {
        console.log(playerInput);

        let speed = 1;
        let newX = this.x - playerInput.h * speed;
        let newY = 0;
        let newZ = this.z - playerInput.v * speed;

        const newRotY = Math.atan2(playerInput.h, playerInput.v);

        // check if next position is within allowed cells
        if (this.room.mapHelper.isTileAvailable(newX, newZ) && this.room.mapHelper.isCellAvailable(this.room.state.entities, newX, newZ)) {
            this.x = newX;
            this.y = newY;
            this.z = newZ;
            this.rot = this.rot + (newRotY - this.rot);
            this.sequence = playerInput.seq;
        }
    }
}
