import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ServerMsg, PlayerInputs } from "../../../../shared/types";
import { Entity } from "../Entity";
import { PlayerInput } from "../../Controllers/PlayerInput";

export class MoveController {
    private _player: Entity;
    private _mesh;
    private speed;
    private _input: PlayerInput;
    private _room;
    private _game;
    public playerInputs: PlayerInputs[] = [];
    private playerLatestSequence: number;

    private nextPosition: Vector3;
    private nextRotation: Vector3;

    private sequence: number = 0;
    private isCurrentPlayer: boolean = false;

    constructor(player: Entity) {
        this._player = player;
        this._input = player._input;
        this._room = player._room;
        this._game = player._game;
        this.isCurrentPlayer = player.isCurrentPlayer;
    }

    public getNextPosition() {
        return this.nextPosition;
    }

    public getNextRotation() {
        return this.nextRotation;
    }

    public setPositionAndRotation(entity): void {
        this.nextPosition = new Vector3(entity.x, entity.y, entity.z);
        this.nextRotation = new Vector3(0, entity.rot, 0);
        console.log();
    }

    // server Reconciliation. Re-apply all the inputs not yet processed by the server
    public reconcileMove(latestSequence) {
        // store latest sequence processed by server
        this.playerLatestSequence = latestSequence;

        // if nothing to apply, do nothin
        if (!this.playerInputs.length) return false;

        var j = 0;
        while (j < this.playerInputs.length) {
            var nextInput = this.playerInputs[j];

            if (nextInput.seq <= this.playerLatestSequence) {
                // Already processed. Its effect is already taken into account into the world update
                // we just got, so we can drop it.
                this.playerInputs.splice(j, 1);
            } else {
                // Not processed by the server yet. Re-apply it.
                this.move(nextInput);
                j++;
            }
        }
    }

    // prediction move
    public predictionMove(latestInput: PlayerInputs) {
        // move player locally
        this.move(latestInput);

        // Save this input for later reconciliation.
        this.playerInputs.push(latestInput);
    }

    //
    public processMove() {
        // detect movement
        if (this._input.player_can_move) {
            // increment seq
            this.sequence++;

            // prepare input to be sent
            let latestInput = {
                seq: this.sequence,
                h: this._input.horizontal,
                v: this._input.vertical,
            };

            // sent current input to server for processing
            this._room.send(ServerMsg.PLAYER_MOVE, latestInput);

            // do client side prediction
            this.predictionMove(latestInput);
        }
    }

    public tween() {
        // continuously lerp between current position and next position
        this._player.position = Vector3.Lerp(this._player.position, this.nextPosition, 0.5);
        this._player.playerMesh.rotation = this.nextRotation;
    }

    public move(playerInput: PlayerInputs): void {
        if (this.isCurrentPlayer) {
            // save current position
            let oldX = this.nextPosition.x;
            let oldY = this.nextPosition.y;
            let oldZ = this.nextPosition.z;
            const newRotY = Math.atan2(playerInput.h, playerInput.v);

            let speed = 1;
            let newX = oldX - playerInput.h * speed;
            let newY = 0;
            let newZ = oldZ - playerInput.v * speed;

            // check it fits in navmesh
            if (this._player._map.isTileAvailable(newX, newZ)) {
                this.nextPosition.x = newX;
                this.nextPosition.z = newZ;
                this.nextRotation.y = this.nextRotation.y + (newRotY - this.nextRotation.y);
            }
        }
    }
}
