import { Schema, type } from "@colyseus/schema";
import { Entity } from "./Entity";
import { GameRoom } from "../GameRoom";
import { CellType, PowerUpTypes, ServerMsg } from "../../../../shared/types";
import { generateId } from "@colyseus/core";
import { Bomb } from "./Bomb";
import { PowerUp } from "./PowerUp";

export class Player extends Entity {
    @type("string") name: string;

    @type("boolean") ready = false;
    @type("boolean") autoReady = false;
    @type("boolean") disconnected = false;
    @type("boolean") admin: boolean = false;

    @type("int8") score: number = 0;
    @type("int8") bombs: number = 1;
    @type("int8") health: number = 1;
    @type("int8") speed: number = 1;
    @type("string") color: string;

    @type("int16") sequence: number = 0;
    @type("float32") rot: number = 0;

    public explosion_size: number;

    constructor(args, room: GameRoom) {
        super(args, room);

        // set type
        this.type = CellType.PLAYER;

        // set default
        this.health = 1; // default health
        this.bombs = 1; // 1 bomb by default
        this.explosion_size = 3; //

        console.log();
    }

    update(dt) {
        super.update(dt);
        if (this.health < 1) {
            this.row = this.spawnPoint.row;
            this.col = this.spawnPoint.col;
            this.health = 1;
        }
    }

    hasPowerUp(row, col) {
        let found;
        this.room.state.powers.forEach((power) => {
            if (power.row === row && power.col === col) {
                found = power;
            }
        });
        return found;
    }

    consumePowerUp(powerup: PowerUp) {
        if (powerup.power === PowerUpTypes.HEALTH) {
            this.health += 1;
        } else if (powerup.power === PowerUpTypes.BOMB) {
            this.bombs += 1;
        } else if (powerup.power === PowerUpTypes.SPEED) {
            this.speed += 1;
        }

        // delete
        this.room.state.powers.delete(powerup.sessionId);
    }

    move(playerInput) {
        // get current cell
        let previousCell = this.room.state.cells.get(this.row + "-" + this.col);

        // calculate new position
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

            // check if power up in next position
            let powerUpFound = this.hasPowerUp(newRow, newCol);
            if (powerUpFound instanceof PowerUp) {
                this.consumePowerUp(powerUpFound);
            }

            // set playerID
            let cell = this.room.state.cells.get(this.row + "-" + this.col);
            if (cell) {
                cell.playerId = this.sessionId;
            }
            if (previousCell) {
                previousCell.playerId = "";
            }
        }
    }

    placeBomb(data) {
        if (this.bombs > 0) {
            let sessionId = "bomb-" + this.row + "-" + this.col;

            // make sure a bomb is not already in this location
            if (this.room.state.bombs.get(sessionId)) {
                return false;
            }

            // add bomb
            let bomb = new Bomb(
                {
                    sessionId: sessionId,
                    owner: this.sessionId,
                    col: this.col,
                    row: this.row,
                    size: this.explosion_size,
                },
                this.room
            );
            this.room.state.bombs.set(bomb.sessionId, bomb);

            // update cell
            let cell = this.room.state.cells.get(this.row + "-" + this.col);
            if (cell) {
                cell.bombId = sessionId;
            }

            // decrease player available bombs
            this.bombs--;
        }
    }
}
