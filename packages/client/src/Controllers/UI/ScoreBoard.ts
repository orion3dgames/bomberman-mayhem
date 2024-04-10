import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "../../Entities/Entity";
import { GameController } from "../GameController";
import { PlayerUI } from "../PlayerUI";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Color3 } from "@babylonjs/core";

export class ScoreBoard {
    private _engine: Engine;
    private _scene: Scene;
    private ping: number = 0;
    private _entity: Entity;
    private _game: GameController;
    private _entities;

    private _ui;
    private _panel;

    constructor(playerUI: PlayerUI, entity) {
        this._ui = playerUI._ui;
        this._entities = playerUI._entities;
        this._scene = playerUI._scene;
        this._game = playerUI._game;

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
        debugPanel.width = "300px;";
        debugPanel.height = "100px;";
        debugPanel.adaptHeightToChildren = false;
        debugPanel.background = "rgba(0,0,0, .5)";
        debugPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        debugPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._ui.addControl(debugPanel);
        this._panel = debugPanel;
    }

    // debug panel refresh
    private _update() {
        // if already exists
        this._panel.children.forEach((el) => {
            el.dispose();
        });

        let top = 0;
        this._entities.forEach((entity) => {
            if (entity.type === "player") {
                const debugText = new TextBlock("debugText", entity.name + ": " + entity.score);
                debugText.color = "#FFF";
                debugText.topInPixels = top;
                debugText.left = "5px";
                debugText.fontSize = "22px;";
                debugText.height = "25px";
                debugText.color = entity.color;
                debugText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
                debugText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                debugText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                debugText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
                this._panel.addControl(debugText);

                top = top + 25;
            }
        });
    }
}
