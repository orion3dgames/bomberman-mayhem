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
    public debug_pressed: boolean = false;

    constructor(entity: Entity) {
        this._moveController = entity.moveController;
        this._scene = entity._scene;
        this._room = entity._room;

        console.log("[PlayerInput]", entity);

        this._scene.onKeyboardObservable.add((kbInfo: { type: any; event: { code: string } }) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    // if
                    if (kbInfo.event.code === "ArrowUp" || kbInfo.event.code === "KeyW") {
                        this.vertical = -1;
                    } else if (kbInfo.event.code === "ArrowDown" || kbInfo.event.code === "KeyS") {
                        this.vertical = 1;
                    } else if (kbInfo.event.code === "ArrowRight" || kbInfo.event.code === "KeyD") {
                        this.horizontal = -1;
                    } else if (kbInfo.event.code === "ArrowLeft" || kbInfo.event.code === "KeyA") {
                        this.horizontal = 1;
                    }

                    if (kbInfo.event.code === "Space") {
                        this.space_pressed = true;
                    }
                    if (kbInfo.event.code === "KeyD") {
                        this.debug_pressed = true;
                    }

                    break;

                case KeyboardEventTypes.KEYUP:
                    // if
                    if (kbInfo.event.code === "ArrowUp" || kbInfo.event.code === "KeyW") {
                        this.vertical = 0;
                    } else if (kbInfo.event.code === "ArrowDown" || kbInfo.event.code === "KeyS") {
                        this.vertical = 0;
                    } else if (kbInfo.event.code === "ArrowRight" || kbInfo.event.code === "KeyD") {
                        this.horizontal = 0;
                    } else if (kbInfo.event.code === "ArrowLeft" || kbInfo.event.code === "KeyA") {
                        this.horizontal = 0;
                    }
                    if (kbInfo.event.code === "Space") {
                        this.space_pressed = false;
                    }
                    if (kbInfo.event.code === "KeyD") {
                        this.debug_pressed = false;
                    }

                    break;
            }

            if (this.horizontal !== 0 || this.vertical !== 0) {
                console.log("[INPUT]", this.horizontal, this.vertical !== 0);
                this.player_can_move = true;
                this._moveController.processMove();
            } else {
                this.player_can_move = false;
            }
        });
    }
}
