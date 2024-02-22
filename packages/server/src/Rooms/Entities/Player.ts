import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
    @type("string") sessionId: string;
    @type("string") displayName: string;
    @type("boolean") ready = false;
    @type("boolean") autoReady = false;
    @type("boolean") disconnected = false;
    @type("boolean") admin: boolean;
    @type("int16") x: number;
    @type("int16") y: number;
    @type("int16") z: number;

    constructor(args) {
        super();

        // add spawn data
        Object.assign(this, args);

        console.log("ASSIGNING DATA TO PLAYER", this);
    }

    move(moveData) {
        console.log(moveData);
        this.x += moveData.h;
        this.z += moveData.v;
    }
}
