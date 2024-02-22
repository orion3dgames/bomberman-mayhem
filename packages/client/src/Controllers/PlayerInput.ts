import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "../Entities/Entity";
import { Room } from "colyseus.js";
import { ServerMsg } from "../../../shared/types";

export class PlayerInput {
    private _scene: Scene;
    private _room: Room;

    private vertical: number = 0;
    private horizontal: number = 0;

    constructor(entity: Entity) {
        this._scene = entity._scene;
        this._room = entity._room;

        this._scene.onKeyboardObservable.add((kbInfo: { type: any; event: { code: string } }) => {
            this.vertical = 0;
            this.horizontal = 0;
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYUP:
                    // if
                    if (kbInfo.event.code === "ArrowUp") {
                        this.vertical = 1;
                    }
                    if (kbInfo.event.code === "ArrowDown") {
                        this.vertical = -1;
                    }
                    if (kbInfo.event.code === "ArrowRight") {
                        this.horizontal = 1;
                    }
                    if (kbInfo.event.code === "ArrowLeft") {
                        this.horizontal = -1;
                    }

                    // send to server
                    this._room.send(ServerMsg.PLAYER_MOVE, { h: this.horizontal, v: this.vertical });

                    break;
            }
        });
    }
}
