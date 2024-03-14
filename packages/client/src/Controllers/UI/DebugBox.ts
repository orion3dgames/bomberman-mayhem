import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture, TextBlock, Rectangle, Control } from "@babylonjs/gui/2D";
import { countPlayers, roundTo } from "../../Utils/Utils";
import { Entity } from "../../Entities/Entity";
import { ServerMsg } from "../../../../shared/types";

export class DebugBox {
    private _engine: Engine;
    private _scene: Scene;
    private _room;
    private ping: number = 0;
    private _entity: Entity;

    private _ui;
    private _debugTextUI;

    constructor(ui: AdvancedDynamicTexture, engine: Engine, scene: Scene, entity: Entity, room) {
        this._ui = ui;
        this._engine = engine;
        this._scene = scene;
        this._entity = entity;
        this._room = room;

        this._createUI();

        // some ui must be constantly refreshed as things change
        this._scene.registerBeforeRender(() => {
            // refresh
            this._update();
        });

        // on pong
        this._room.onMessage(ServerMsg.PONG, (data) => {
            let dateNow = Date.now();
            this.ping = dateNow - data.date;
        });
    }

    _createUI() {
        let debugPanel = new Rectangle("panel-debugBox");
        debugPanel.top = "60px";
        debugPanel.left = "-15px";
        debugPanel.width = "150px;";
        debugPanel.height = "300px;";
        debugPanel.background = "rgba(0,0,0,.5)";
        debugPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        debugPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this._ui.addControl(debugPanel);

        const debugText = new TextBlock("debugText", "");
        debugText.color = "#FFF";
        debugText.top = "5px";
        debugText.left = "5px";
        debugText.fontSize = "12px;";
        debugText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        debugText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        debugPanel.addControl(debugText);

        this._debugTextUI = debugText;
    }

    // debug panel refresh
    private _update() {
        let locationText = "";
        locationText += "RoomId: " + this._entity._room.roomId + " \n";
        locationText += "SessionId: " + this._entity.sessionId + " \n";
        locationText += "Name: " + this._entity.name + " \n";
        locationText += "Total Entities: " + 0 + " \n";
        locationText += "FPS: " + roundTo(this._engine.getFps(), 0) + " \n";
        locationText += "Ping: " + this.ping + "ms\n";
        locationText += "X: " + roundTo(this._entity.position.x, 2) + " ---> " + this._entity.col + "\n";
        locationText += "y: " + roundTo(this._entity.position.y, 2) + "\n";
        locationText += "z: " + roundTo(this._entity.position.z, 2) + " ---> " + this._entity.row + "\n";
        locationText += "RotX: " + roundTo(this._entity.playerMesh.rotation.x, 2) + "\n";
        locationText += "RotY: " + roundTo(this._entity.playerMesh.rotation.y, 2) + "\n";
        locationText += "RotZ: " + roundTo(this._entity.playerMesh.rotation.z, 2) + "\n";
        this._debugTextUI.text = locationText;
    }
}
