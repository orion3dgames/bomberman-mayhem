import { Schema, type } from "@colyseus/schema";
import { GameRoom } from "../GameRoom";
import { Entity } from "./Entity";
import { CellType } from "../../../../shared/types";
import tiles from "../../../../shared/Data/tiles.json";
import { Player } from "./Player";
import { Cell } from "./Cell";
import { generateId } from "@colyseus/core/build/utils/Utils";

export class Bomb extends Entity {
    @type("int8") size: number = 3;

    public owner;

    constructor(args, room: GameRoom) {
        super(args, room);

        // add spawn data
        Object.assign(this, args);

        this.type = CellType.BOMB;

        // set 3 seconds timer
        setTimeout(() => {
            this.trigger();
        }, 3000);
    }

    trigger() {
        const dirs = [
            {
                // up
                col: -1,
                row: 0,
            },
            {
                // down
                col: 1,
                row: 0,
            },
            {
                // left
                col: 0,
                row: -1,
            },
            {
                // right
                col: 0,
                row: 1,
            },
        ];

        // for every direction
        dirs.forEach((dir) => {
            // for distance
            for (let i = 0; i <= this.size; i++) {
                const col = this.col + dir.col * i;
                const row = this.row + dir.row * i;

                // get cell
                const cell = this.room.state.cells.get(row + "-" + col);

                // stop the explosion if it hit a wall
                if (cell.type === CellType.WALL) {
                    return;
                }

                // if breakable wall, remove and replace it
                if (cell.type === CellType.BREAKABLE_WALL) {
                    // remove wall
                    this.room.state.cells.delete(cell.sessionId);

                    // replace with ground
                    let newCell = new Cell(
                        {
                            sessionId: row + "-" + col,
                            row: row,
                            col: col,
                            type: CellType.GROUND,
                        },
                        this.room
                    );
                    this.room.state.cells.set(newCell.sessionId, newCell);

                    // stop the explosion if hit anything
                    return;
                }

                // bomb hit another bomb so blow that one up too
                // todo:
            }
        });

        this.delete();
    }

    public delete() {
        // increase player available bombs
        const playerState: Player = this.room.state.players.get(this.owner) as Player;
        playerState.bombs++;

        // remove bomb
        this.room.state.bombs.delete(this.sessionId);
    }
}
