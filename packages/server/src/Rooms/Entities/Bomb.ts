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
                this.room.state.entities.forEach((entity) => {
                    // if breakable wall
                    if (entity.type === CellType.BREAKABLE_WALL && col === entity.col && row === entity.row) {
                        // remove entity
                        this.room.state.entities.delete(entity.sessionId);

                        // update cell
                        this.room.mapHelper.cells[col][row] = tiles.ground;
                    }
                    // if bomb
                    // trigger the bomb also
                });

                // remove any players
            }
        });

        this.delete();
    }

    public delete() {
        const playerState: Player = this.room.state.players.get(this.owner) as Player;
        playerState.bombs++;

        // update cell
        this.room.mapHelper.cells[this.col][this.row] = tiles.ground;

        // remove bomb
        this.room.state.entities.delete(this.sessionId);
    }
}
