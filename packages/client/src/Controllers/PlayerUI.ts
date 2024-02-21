import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { DebugBox } from "./UI/DebugBox";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Entity } from "../Entities/Entity";
import { SceneName } from "../../../shared/types";
import { GameScene } from "../Scenes/GameScene";

export class PlayerUI {
    private _scene: Scene;
    private _engine: Engine;

    public _room;
    public _players;
    public _currentPlayer;

    public _ui: AdvancedDynamicTexture;
    public _uiLabels: AdvancedDynamicTexture;
    public _DebugBox: DebugBox;

    constructor(scene, engine, gameScene: GameScene) {
        this._scene = scene;
        this._engine = engine;

        // create ui
        this._uiLabels = AdvancedDynamicTexture.CreateFullscreenUI("UI_Names", true, this._scene);

        // create adt
        this._ui = AdvancedDynamicTexture.CreateFullscreenUI("UI_Player", true, this._scene);

        // create base ui
        this.create(gameScene);
    }

    setCurrentPlayer(entity) {
        // create debug ui + events
        this._DebugBox = new DebugBox(this._ui, this._engine, this._scene, entity);
    }

    create(gameScene) {
        const cancelButton = Button.CreateSimpleButton("cancelButton", "QUIT");
        cancelButton.widthInPixels = 100;
        cancelButton.topInPixels = 15;
        cancelButton.leftInPixels = -15;
        cancelButton.height = "30px";
        cancelButton.color = "black";
        cancelButton.background = "white";
        cancelButton.thickness = 1;
        cancelButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        cancelButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._ui.addControl(cancelButton);

        cancelButton.onPointerUpObservable.add(() => {
            gameScene._room.leave();
            gameScene._game.setScene(SceneName.HOME);
        });
    }

    public createEntityLabel(entity) {
        let title = entity.name;
        var rect1 = new Rectangle("item_nameplate_" + entity.sessionId);
        rect1.isVisible = true;
        rect1.width = "200px";
        rect1.height = "40px";
        rect1.thickness = 0;
        this._uiLabels.addControl(rect1);
        rect1.linkWithMesh(entity);
        rect1.linkOffsetY = -30;

        var label = new TextBlock("item_nameplate_text_" + entity.sessionId);
        label.text = title;
        label.color = "black";
        label.fontWeight = "bold";
        label.fontSize = "14px";
        label.outlineWidth = 3;
        label.outlineColor = "white";
        rect1.addControl(label);
        return rect1;
    }
}
