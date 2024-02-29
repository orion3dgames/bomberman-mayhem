import { Schema, type } from "@colyseus/schema";
import { GameRoom } from "../GameRoom";
import { CellType } from "../../../../shared/types";

export class Cell extends Schema {
    @type("string") sessionId: string = "";
    @type("string") type: CellType;
    @type("int8") col: number = 0;
    @type("int8") row: number = 0;
    @type("string") playerId: string; // ID of the player occupying the cell (if any)
    @type("string") bombId: string; // ID of the bomb occupying the cell (if any)

    public cellInfo;

    constructor(args, room: GameRoom) {
        super(args, room);

        // add spawn data
        Object.assign(this, args);

        // get tile data
        this.cellInfo = room.mapHelper.findTile(this.type, "name");
    }
}
