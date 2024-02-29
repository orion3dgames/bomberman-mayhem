import { Schema, type } from "@colyseus/schema";
import { Entity } from "./Entity";
import { GameRoom } from "../GameRoom";
import { CellType, ServerMsg } from "../../../../shared/types";
import { generateId } from "@colyseus/core";
import { Bomb } from "./Bomb";

export class Player extends Entity {
    @type("string") name: string;

    @type("boolean") ready = false;
    @type("boolean") autoReady = false;
    @type("boolean") disconnected = false;
    @type("boolean") admin: boolean = false;

    @type("int8") score: number = 0;
    @type("int8") bombs: number;

    @type("int16") sequence: number = 0;
    @type("float32") rot: number = 0;

    public explosion_size: number;

    constructor(args, room: GameRoom) {
        super(args, room);

        // set type
        this.type = CellType.PLAYER;

        // set default
        this.bombs = 1; // 1 bomb by default
        this.explosion_size = 2; //
    }

    move(playerInput) {
        console.log(playerInput);

        let speed = 1;
        let newCol = this.col - playerInput.h * speed;
        let newRow = this.row - playerInput.v * speed;

        const newRotY = Math.atan2(playerInput.h, playerInput.v);

        // check if next position is within allowed cell
        if (this.room.mapHelper.isCellAvailable(this.room.state.cells, newRow, newCol)) {
            this.col = newCol;
            this.row = newRow;
            this.rot = this.rot + (newRotY - this.rot);
            this.sequence = playerInput.seq;
        }
    }

    placeBomb(data) {
        if (this.bombs > 0) {
            console.log(ServerMsg[ServerMsg.PLACE_BOMB], data);
            let bomb = new Bomb(
                {
                    sessionId: generateId(),
                    owner: this.sessionId,
                    col: this.col,
                    row: this.row,
                    size: this.explosion_size,
                },
                this.room
            );

            this.room.state.bombs.set(bomb.sessionId, bomb);

            this.bombs--;
        }
    }
}
