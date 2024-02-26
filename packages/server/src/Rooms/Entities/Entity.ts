import { Schema, type } from "@colyseus/schema";
import { GameRoom } from "../GameRoom";

export class Entity extends Schema {
    @type("string") sessionId: string;
    @type("string") type: string;
    @type("int16") x: number = 0;
    @type("int16") y: number = 0;
    @type("int16") z: number = 0;
    @type("float32") rot: number = 0;

    public room: GameRoom;

    constructor(args, room: GameRoom) {
        super();

        this.room = room;

        // add spawn data
        Object.assign(this, args);

        this.type = "entity";
    }
}
