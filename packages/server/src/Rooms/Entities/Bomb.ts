import { Schema, type } from "@colyseus/schema";
import { GameRoom } from "../GameRoom";
import { Entity } from "./Entity";
import { CellType } from "../../../../shared/types";
import tiles from "../../../../shared/Data/tiles.json";
import { Player } from "./Player";

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

                // remove entities
                this.room.state.cells.forEach((entity) => {
                    // is cell in blast radius
                    if (col === entity.col && row === entity.row) {
                        if (entity.type === CellType.BREAKABLE_WALL) {
                            // remove entity
                            this.room.state.cells.delete(entity.sessionId);
                        }
                    }
                });

                // remove any players
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
