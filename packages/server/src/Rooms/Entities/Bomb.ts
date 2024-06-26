import { Schema, type } from "@colyseus/schema";
import { GameRoom } from "../GameRoom";
import { Entity } from "./Entity";
import { CellType, ServerMsg } from "../../../../shared/types";
import { Player } from "./Player";
import { Cell } from "./Cell";
import { PowerUp } from "./PowerUp";

export class Bomb extends Entity {
    @type("int8") size: number = 3;

    public owner;
    public timeoutTimer;
    public timeout: number = 3000;

    constructor(args, room: GameRoom) {
        super(args, room);

        // add spawn data
        Object.assign(this, args);

        this.type = CellType.BOMB;

        // set 3 seconds timer
        this.timeoutTimer = setTimeout(() => {
            this.trigger();
        }, this.timeout);
    }

    trigger() {
        // remove any timers
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
        }

        // clear bomb from cell
        let currentCell = this.room.state.cells.get(this.row + "-" + this.col);
        if (currentCell) {
            currentCell.bombId = "";
        }

        //
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
        let positions = new Map();
        let players = new Map();

        dirs.forEach((dir) => {
            // for distance
            for (let i = 0; i <= this.size; i++) {
                const col = this.col + dir.col * i;
                const row = this.row + dir.row * i;

                let key = row + "-" + col;

                // get cell
                const cell = this.room.state.cells.get(row + "-" + col);

                // cell must exists
                if (!cell) {
                    return false;
                }

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
                    positions.set(key, { row: row, col: col });

                    // 50% chance for a powerup to appear
                    if (Math.random() <= 0.5) {
                        let powerUp = new PowerUp(
                            {
                                sessionId: row + "-" + col,
                                row: row,
                                col: col,
                                type: CellType.POWER_UP,
                            },
                            this.room
                        );
                        this.room.state.powers.set(powerUp.sessionId, powerUp);
                    }

                    // stop the explosion if hit anything
                    return;
                }

                // check if player is hit
                if (cell.playerId !== "") {
                    players.set(cell.playerId, cell.playerId);
                }

                // else explosion can continue
                positions.set(key, { row: row, col: col });

                // bomb hit another bomb so blow that one up too
                if (cell.bombId) {
                    let bomb = this.room.state.bombs.get(cell.bombId);
                    setTimeout(() => bomb.trigger(), 400); // slight delay
                }
            }
        });

        // decrease life of players in explosion
        // nota: make sure to only decrease 1 life at the time?
        players.forEach((sessionId) => {
            const player = this.room.state.players.get(sessionId);
            if (player) {
                player.health--;
            }
        });

        this.delete(positions);
    }

    public delete(positions) {
        // increase player available bombs
        const playerState: Player = this.room.state.players.get(this.owner) as Player;
        playerState.bombs++;

        // remove bomb
        this.room.state.bombs.delete(this.sessionId);

        // trigger explosion
        console.log("TIGGER EXPLOSION", positions);
        this.room.broadcast(ServerMsg.DO_EXPLOSION, {
            row: this.row,
            col: this.col,
            size: this.size,
            cells: positions,
        });
    }
}
