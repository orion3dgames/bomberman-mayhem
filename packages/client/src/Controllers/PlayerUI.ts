import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { DebugBox } from "./UI/DebugBox";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock, TextWrapping } from "@babylonjs/gui/2D/controls/textBlock";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Entity } from "../Entities/Entity";
import { SceneName } from "../../../shared/types";
import { GameScene } from "../Scenes/GameScene";
import { CharacterStats } from "./UI/CharacterStats";

export class PlayerUI {
    private _scene: Scene;
    private _engine: Engine;
    private _game;
    private _entities;

    public _room;
    public _players;
    public _currentPlayer;

    public _ui: AdvancedDynamicTexture;
    public _uiLabels: AdvancedDynamicTexture;

    public _DebugBox: DebugBox;
    public _CharacterStats: CharacterStats;

    constructor(scene, engine, gameScene: GameScene) {
        this._scene = scene;
        this._engine = engine;
        this._game = gameScene._game;
        this._entities = gameScene.entities;

        // create ui
        this._uiLabels = AdvancedDynamicTexture.CreateFullscreenUI("UI_Names", true, this._scene);

        // create adt
        this._ui = AdvancedDynamicTexture.CreateFullscreenUI("UI_Player", true, this._scene);

        // create base ui
        this.create(gameScene);
    }

    setCurrentPlayer(entity) {
        // create debug ui + events
        //this._DebugBox = new DebugBox(this._ui, this._engine, this._scene, entity);

        //
        this._CharacterStats = new CharacterStats(this._ui, this._engine, this._scene, entity, this._game);

        // debug
        /*
        setTimeout(() => {
            this._entities.forEach((element) => {
                if (element.type !== "player") {
                    this.createDebugCells(element);
                }
            });
        }, 500);*/
    }

    create(gameScene) {
        const cancelButton = Button.CreateSimpleButton("cancelButton", "QUIT");
        cancelButton.fontFamily = this._game.config.fontFamily;
        cancelButton.widthInPixels = 100;
        cancelButton.topInPixels = 15;
        cancelButton.leftInPixels = -15;
        cancelButton.height = "30px";
        cancelButton.color = this._game.config.primary_color;
        cancelButton.background = "white";
        cancelButton.thickness = 1;
        cancelButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        cancelButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._ui.addControl(cancelButton);

        cancelButton.onPointerUpObservable.add(() => {
            window.location.hash = "";
            gameScene.room.leave();
            gameScene._game.setScene(SceneName.HOME);
        });
    }

    public createDebugCells(entity) {
        let title = entity.id;
        var rect1 = new Rectangle("item_nameplate_" + entity.sessionId);
        rect1.isVisible = true;
        rect1.width = "100px";
        rect1.height = "40px";
        rect1.alpha = 1;
        rect1.thickness = 0;
        this._uiLabels.addControl(rect1);
        rect1.linkWithMesh(entity);
        rect1.linkOffsetY = -10;

        var label = new TextBlock("item_nameplate_text_" + entity.sessionId);
        label.fontFamily = "Arial";
        label.text = title;
        label.color = "black";
        label.fontWeight = "bold";
        label.fontSize = "10px";
        label.textWrapping = TextWrapping.WordWrap;
        rect1.addControl(label);
        return rect1;
    }

    public createEntityLabel(entity) {
        let title = entity.name !== "" ? entity.name : entity.id;
        console.log(title);
        var rect1 = new Rectangle("item_nameplate_" + entity.sessionId);
        rect1.isVisible = true;
        rect1.width = "100px";
        rect1.height = "40px";
        rect1.thickness = 0;
        this._uiLabels.addControl(rect1);
        rect1.linkWithMesh(entity);
        rect1.linkOffsetY = -10;

        var label = new TextBlock("item_nameplate_text_" + entity.sessionId);
        label.fontFamily = this._game.config.fontFamily;
        label.text = title;
        label.color = this._game.config.secondary_color;
        label.fontWeight = "bold";
        label.fontSize = "16px";
        label.textWrapping = TextWrapping.WordWrap;
        label.outlineWidth = 3;
        label.outlineColor = this._game.config.primary_color;
        rect1.addControl(label);
        return rect1;
    }
}
