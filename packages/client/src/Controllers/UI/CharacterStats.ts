import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture, TextBlock, Rectangle, Control } from "@babylonjs/gui/2D";
import { countPlayers, roundTo } from "../../Utils/Utils";
import { Entity } from "../../Entities/Entity";
import { GameController } from "../GameController";

export class CharacterStats {
    private _engine: Engine;
    private _scene: Scene;
    private ping: number = 0;
    private _entity: Entity;
    private _game: GameController;

    private _ui;
    private _debugTextUI;

    constructor(ui: AdvancedDynamicTexture, engine: Engine, scene: Scene, entity: Entity, game: GameController) {
        this._ui = ui;
        this._engine = engine;
        this._scene = scene;
        this._entity = entity;
        this._game = game;

        this._createUI();

        // some ui must be constantly refreshed as things change
        this._scene.registerBeforeRender(() => {
            // refresh
            this._update();
        });
    }

    _createUI() {
        let debugPanel = new Rectangle("panel-debugBox");
        debugPanel.thickness = 0;
        debugPanel.top = "15px";
        debugPanel.fontFamily = this._game.config.fontFamily;
        debugPanel.left = "15px";
        debugPanel.width = "150px;";
        debugPanel.height = "300px;";
        debugPanel.background = "rgba(0,0,0,0)";
        debugPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        debugPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._ui.addControl(debugPanel);

        const debugText = new TextBlock("debugText", "");
        debugText.color = "#FFF";
        debugText.top = "5px";
        debugText.left = "5px";
        debugText.fontSize = "24px;";
        debugText.color = this._game.config.secondary_color;
        debugText.outlineWidth = 10;
        debugText.outlineColor = this._game.config.primary_color;
        debugText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        debugText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        debugPanel.addControl(debugText);

        this._debugTextUI = debugText;
    }

    // debug panel refresh
    private _update() {
        let locationText = "";
        locationText += "Health: " + this._entity.health + " \n";
        locationText += "Bombs: " + this._entity.bombs + " \n";
        locationText += "FPS: " + this._engine.getFps() + " \n";
        this._debugTextUI.text = locationText;
    }
}
