import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "../Entity";
import { Room } from "colyseus.js";
import { MoveController } from "./MoveController";

export class PlayerInput {
    private _scene: Scene;
    private _room: Room;
    private _moveController: MoveController;

    public vertical: number = 0;
    public horizontal: number = 0;

    public player_can_move: boolean = false;
    public space_pressed: boolean = false;

    constructor(entity: Entity) {
        this._moveController = entity.moveController;
        this._scene = entity._scene;
        this._room = entity._room;

        console.log("[PlayerInput]", entity);

        this._scene.onKeyboardObservable.add((kbInfo: { type: any; event: { code: string } }) => {
            this.vertical = 0;
            this.horizontal = 0;

            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    // if
                    if (kbInfo.event.code === "ArrowUp") {
                        this.vertical = -1;
                    }
                    if (kbInfo.event.code === "ArrowDown") {
                        this.vertical = 1;
                    }
                    if (kbInfo.event.code === "ArrowRight") {
                        this.horizontal = -1;
                    }
                    if (kbInfo.event.code === "ArrowLeft") {
                        this.horizontal = 1;
                    }
                    if (kbInfo.event.code === "Space") {
                        this.space_pressed = true;
                    }

                    break;

                case KeyboardEventTypes.KEYUP:
                    // if
                    if (kbInfo.event.code === "ArrowUp") {
                        this.vertical = 0;
                    }
                    if (kbInfo.event.code === "ArrowDown") {
                        this.vertical = 0;
                    }
                    if (kbInfo.event.code === "ArrowRight") {
                        this.horizontal = 0;
                    }
                    if (kbInfo.event.code === "ArrowLeft") {
                        this.horizontal = 0;
                    }
                    if (kbInfo.event.code === "Space") {
                        this.space_pressed = false;
                    }

                    break;
            }

            if (this.horizontal > 0 || this.horizontal < 0 || this.vertical > 0 || this.vertical < 0) {
                this.player_can_move = true;
                this._moveController.move(this.vertical, this.horizontal);
            } else {
                this.player_can_move = false;
            }

            console.log(this.vertical, this.horizontal, this.player_can_move);
        });
    }
}
