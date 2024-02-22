import { Schema, type } from "@colyseus/schema";
import { GameRoom } from "../GameRoom";

export class Player extends Schema {
    @type("string") sessionId: string;
    @type("string") name: string;
    @type("boolean") ready = false;
    @type("boolean") autoReady = false;
    @type("boolean") disconnected = false;
    @type("boolean") admin: boolean = false;
    @type("int16") x: number = 0;
    @type("int16") y: number = 0;
    @type("int16") z: number = 0;
    @type("int16") sequence: number = 0;

    public room: GameRoom;

    constructor(args, room: GameRoom) {
        super();

        this.room = room;

        // add spawn data
        Object.assign(this, args);
    }

    move(playerInput) {
        console.log(playerInput);

        let speed = 1;
        let newX = this.x - playerInput.h * speed;
        let newY = 0;
        let newZ = this.z - playerInput.v * speed;

        // check if next position is within allowed cells
        if (this.room.mapHelper.isTileAvailable(newX, newZ)) {
            this.x = newX;
            this.y = newY;
            this.z = newZ;
            this.sequence = playerInput.seq;
        }
    }
}
