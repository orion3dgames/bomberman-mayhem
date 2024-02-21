import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { DebugBox } from "./UI/DebugBox";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

export class PlayerUI {
    private _scene: Scene;
    private _engine: Engine;

    public _room;
    public _players;
    public _currentPlayer;

    public _ui: AdvancedDynamicTexture;
    public _uiLabels: AdvancedDynamicTexture;
    public _DebugBox: DebugBox;

    constructor(scene, engine, entity) {
        this._scene = scene;
        this._engine = engine;

        // create ui
        this._uiLabels = AdvancedDynamicTexture.CreateFullscreenUI("UI_Names", true, this._scene);

        // create adt
        this._ui = AdvancedDynamicTexture.CreateFullscreenUI("UI_Player", true, this._scene);

        //
        this._currentPlayer = entity;

        // create debug ui + events
        this._DebugBox = new DebugBox(this._ui, this._engine, this._scene, entity);
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
