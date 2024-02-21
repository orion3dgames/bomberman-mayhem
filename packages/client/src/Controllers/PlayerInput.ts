import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "../Entities/Entity";
import { LevelController } from "./LevelController";

export class PlayerInput {
    private _scene: Scene;
    private _generator: LevelController;

    constructor(entity: Entity) {
        this._scene = entity._scene;
        this._generator = entity._generator;

        this._scene.onKeyboardObservable.add((kbInfo: { type: any; event: { code: string } }) => {
            let row = entity.row;
            let col = entity.col;
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    if (kbInfo.event.code === "ArrowUp") {
                        col++;
                    }
                    if (kbInfo.event.code === "ArrowDown") {
                        col--;
                    }
                    if (kbInfo.event.code === "ArrowRight") {
                        row++;
                    }
                    if (kbInfo.event.code === "ArrowLeft") {
                        row--;
                    }

                    // check if allowed to move
                    console.log(row, col);
                    if (!this._generator.cells[row][col]) {
                        entity.row = row;
                        entity.col = col;
                    }

                    break;
            }
        });
    }
}
