import { Schema, MapSchema, type } from "@colyseus/schema";

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

    constructor(args) {
        super();

        // add spawn data
        Object.assign(this, args);
    }

    move(playerInput) {
        console.log(playerInput);

        let speed = 1;
        let newX = this.x - playerInput.h * speed;
        let newY = 0;
        let newZ = this.z - playerInput.v * speed;

        this.x = newX;
        this.y = newY;
        this.z = newZ;
        this.sequence = playerInput.seq;
    }
}
