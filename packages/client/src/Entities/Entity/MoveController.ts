import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ServerMsg, PlayerInputs, CellType } from "../../../../shared/types";
import { Entity } from "../Entity";
import { PlayerInput } from "./PlayerInput";
import { CubicEase, EasingFunction, SineEase } from "@babylonjs/core/Animations/easing";
import { Animation } from "@babylonjs/core/Animations/animation";
import { fxaaPixelShader } from "@babylonjs/core/Shaders/fxaa.fragment";
import { Scene } from "@babylonjs/core/scene";

export class MoveController {
    private _player: Entity;
    private _mesh;
    private speed;
    private _input: PlayerInput;
    private _room;
    private _game;
    private _scene: Scene;
    public playerInputs: PlayerInputs[] = [];
    private playerLatestSequence: number;

    private nextPosition: Vector3;
    private nextRotation: Vector3;

    private sequence: number = 0;
    private isCurrentPlayer: boolean = false;
    private isMoving: boolean = false;

    public isAnimating: boolean = false;

    constructor(player: Entity) {
        this._scene = player._scene;
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
        this._player.position = new Vector3(entity.col, 0, entity.row);
        //this._player.playerMesh.rotation = new Vector3(0, entity.rot, 0);
    }

    public tween() {
        //this._player.position = Vector3.Lerp(this._player.position, this.nextPosition, 0.4);
        //this._player.playerMesh.rotation = this.nextRotation;
    }

    public move(vertical, horizontal) {
        // do not move until animation is finished
        if (this.isAnimating) {
            return false;
        }

        // set a few variables
        console.log("[move]", vertical, horizontal, this.isAnimating);
        let instance = this._player.playerMesh;
        let totalAnimationLength = 60;
        let animationSpeed = 4;

        // set angle and direction
        let angle = Math.PI / 2;
        let direction = "x";
        if (horizontal > 0 || horizontal < 0) {
            direction = "z";
        }

        if (vertical > 0 || horizontal < 0) {
            angle = -(Math.PI / 2);
        }

        // set pivot point
        let size = 1 / 2;
        if (horizontal < 0) {
            instance.setPivotPoint(new Vector3(size, -size, 0)); // left
        }
        if (horizontal > 0) {
            instance.setPivotPoint(new Vector3(-size, -size, 0)); // right
        }
        if (vertical < 0) {
            instance.setPivotPoint(new Vector3(0, -size, size)); // top
        }
        if (vertical > 0) {
            instance.setPivotPoint(new Vector3(0, -size, -size)); // bottom
        }

        console.log("[move]", angle, "rotation." + direction);

        // Creating an easing function
        const easingFunction = new SineEase();
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT); // For each easing function, you can choose between EASEIN (default), EASEOUT, EASEINOUT

        //Animate the bomb
        const animWheel = new Animation("wheelAnimation", "rotation." + direction, 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);

        //At the animation key 0, the value of rotation.y is 0
        const wheelKeys = [];
        wheelKeys.push(
            {
                frame: 0,
                value: 0,
            },
            {
                frame: totalAnimationLength,
                value: angle,
            }
        );

        //set the keys
        animWheel.setKeys(wheelKeys);
        animWheel.setEasingFunction(easingFunction);

        //Link this animation to a bomb
        instance.animations = [];
        instance.animations.push(animWheel);

        // calculate position
        let newPosition = this.calculateNewPosition(horizontal, vertical);

        // start animation
        this._scene.beginAnimation(instance, 0, totalAnimationLength, false, animationSpeed, () => {
            console.log("[move]", "ANIMATION FINISHED", this._player.playerMesh.rotation);
            this._player.playerMesh.rotation = new Vector3(0, 0, 0);
            this._player.position = newPosition;
            instance.setPivotPoint(new Vector3(0, 0, 0));
            this.isAnimating = false;
        });

        console.log("[move]", "ANIMATION STARTED");
        this.isAnimating = true;
    }

    public calculateNewPosition(horizontal, vertical): Vector3 {
        let speed = 1;
        let newCol = this._player.position.x - horizontal * speed;
        let newRow = this._player.position.z - vertical * speed;
        return new Vector3(newCol, 0, newRow);
    }

    public processMove() {
        console.log("[move]", "PROCESS MOVE");
        // detect movement
        if (!this.isAnimating) {
            console.log("[move]", "CAN PROCESS MOVE");
            // increment seq
            this.sequence++;

            // prepare input to be sent
            let latestInput = {
                seq: this.sequence,
                h: this._player._input.horizontal,
                v: this._player._input.vertical,
            };

            if (this.canMove(latestInput)) {
                console.log("[move]", "NAVMESH PASS");
                // sent current input to server for processing
                this._room.send(ServerMsg.PLAYER_MOVE, latestInput);

                // do client side prediction
                this.predictionMove(latestInput);
            } else {
                console.log("[move]", "NAVMESH DENIED");
                this._player._input.player_can_move = false;
                this._player._input.horizontal = 0;
                this._player._input.vertical = 0;
            }
        }
    }

    // prediction move
    public predictionMove(latestInput: PlayerInputs) {
        // move player locally
        this.move(latestInput.v, latestInput.h);

        // Save this input for later reconciliation.
        this.playerInputs.push(latestInput);
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
                this.move(nextInput.v, nextInput.h);
                j++;
            }
        }
    }

    public canMove(playerInput) {
        let newPosition = this.calculateNewPosition(playerInput.h, playerInput.v);
        let cell = this._room.state.cells.get(newPosition.z + "-" + newPosition.x);
        if (cell && cell.type === CellType.GROUND) {
            return true;
        }
        return false;
    }

    /*

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

            // send to server
            this._room.send(ServerMsg.PLAYER_MOVE, latestInput);

            
            if (this.canMove(latestInput)) {
                // sent current input to server for processing
                this._room.send(ServerMsg.PLAYER_MOVE, latestInput);

                // do client side prediction
                this.predictionMove(latestInput);
            }
        }
    }

    public canMove(playerInput) {
        let speed = 1;
        let newCol = this.nextPosition.x - playerInput.h * speed;
        let newRow = this.nextPosition.z - playerInput.v * speed;
        let cell = this._room.state.cells.get(newRow + "-" + newCol);
        if (cell && cell.type === CellType.GROUND) {
            return true;
        }
        return false;
    }

    public move(playerInput: PlayerInputs): void {
        // calculate position
        let speed = 1;
        let newCol = this.nextPosition.x - playerInput.h * speed;
        let newRow = this.nextPosition.z - playerInput.v * speed;
        const newRotY = Math.atan2(playerInput.h, playerInput.v);
        // apply new position
        this.nextPosition.x = newCol;
        this.nextPosition.z = newRow;
        this.nextRotation.y = this.nextRotation.y + (newRotY - this.nextRotation.y);

        
        if (this.isCurrentPlayer && this.canMove(playerInput)) {
            // calculate position
            let speed = 1;
            let newCol = this.nextPosition.x - playerInput.h * speed;
            let newRow = this.nextPosition.z - playerInput.v * speed;
            const newRotY = Math.atan2(playerInput.h, playerInput.v);
            // apply new position
            this.nextPosition.x = newCol;
            this.nextPosition.z = newRow;
            this.nextRotation.y = this.nextRotation.y + (newRotY - this.nextRotation.y);
        }
        
    }

    
    public tween() {
        this._player.position = Vector3.Lerp(this._player.position, this.nextPosition, 0.5);
        this._player.playerMesh.rotation = this.nextRotation;
    }*/
}
