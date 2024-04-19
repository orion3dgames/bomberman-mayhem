import { Schema, type } from "@colyseus/schema";
import { GameRoom } from "../GameRoom";
import { Entity } from "./Entity";
import { CellType, PowerUpTypes, ServerMsg } from "../../../../shared/types";
import { getRandomEnumValue, getRandomInt } from "../../../../shared/Utils/Utils";

export class PowerUp extends Entity {
    @type("int8") power: number = 0;

    constructor(args, room: GameRoom) {
        super(args, room);

        // add spawn data
        Object.assign(this, args);

        // this is powerup cell
        this.type = CellType.POWER_UP;

        // this is the power up power
        let rand = getRandomInt(0, 2);
        this.power = rand;

        console.log();
    }

    public delete() {
        this.room.state.powers.delete(this.sessionId);
    }
}
