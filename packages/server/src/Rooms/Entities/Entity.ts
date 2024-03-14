import { Schema, type } from "@colyseus/schema";
import { GameRoom } from "../GameRoom";
import { CellType } from "../../../../shared/types";

export class Entity extends Schema {
    @type("string") sessionId: string;
    @type("string") type: CellType;
    @type("int8") col: number = 0;
    @type("int8") row: number = 0;

    public room: GameRoom;
    public spawnPoint;

    constructor(args, room: GameRoom) {
        super();

        this.room = room;

        // add spawn data
        Object.assign(this, args);

        console.log(this.spawnPoint, args);
    }

    public update(dt) {}
}
