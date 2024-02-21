import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { InputText } from "@babylonjs/gui/2D/controls/inputText";
import { InputPassword } from "@babylonjs/gui/2D/controls/inputPassword";
import { Image } from "@babylonjs/gui/2D/controls/image";

import { GameController } from "../Controllers/GameController";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { SceneName } from "../../../shared/types";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { LevelController } from "../Controllers/LevelController";
import { PlayerCamera } from "../Controllers/PlayerCamera";
import { Entity } from "../Entities/Entity";

export class GameScene {
    private _game: GameController;
    public _scene: Scene;
    public _engine: Engine;
    public _newState: SceneName;
    public _button: Button;
    public _ui;
    public _environment;
    public _loadedAssets: AssetContainer[] = [];
    public _shadow;
    public _generator: LevelController;
    public _camera: PlayerCamera;
    public room;
    public sessionId;
    public entities = new Map();

    constructor() {
        this._newState = SceneName.NULL;
    }

    async createScene(game): Promise<void> {
        // app
        this._game = game;
        this._engine = this._game.engine;

        // create scene
        let scene = new Scene(this._game.engine);

        // set scene
        this._scene = scene;

        // set sky color
        this._scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

        // set lightsa
        let light = new HemisphericLight("light", Vector3.Up(), this._scene);
        light.intensity = 0.8;

        // generate level
        this._generator = new LevelController(this._scene, "map_01");

        // start camera
        this._camera = new PlayerCamera(this._scene);

        // setup colyseus room
        // hack for devlopement
        if (!this._game.joinedRoom) {
            let hash = window.location.hash.substring(1);
            this._game.joinedRoom = await this._game.client.createOrJoin(hash, this._game.user);
        }

        // set room
        this.room = this._game.joinedRoom;
        this.sessionId = this.room.sessionId;

        // new player
        this.room.state.players.onAdd((entity, sessionId) => {
            console.log("ENTITY ADDED", entity);
            let currentPlayer = sessionId === this.sessionId;
            this.entities.set(sessionId, new Entity(sessionId, this._scene, this, entity, currentPlayer));
        });

        // removing player
        this.room.state.players.onRemove((entity, sessionId) => {
            console.log("ENTITY LEFT", sessionId);
            this.entities.delete(sessionId);
        });

        // game loop
        let timeServer = Date.now();
        this._scene.registerBeforeRender(() => {
            let delta = this._engine.getFps();
            let timeNow = Date.now();

            // game update loop
            this.entities.forEach((entity) => {
                entity.update(delta);
            });

            // server update rate
            let rate = 200;
            let timePassed = (timeNow - timeServer) / 1000;
            let updateRate = rate / 1000; // game is networked update every 100ms
            if (timePassed >= updateRate) {
                // player uppdate at server rate
                this.entities.forEach((entity) => {
                    entity.updateServerRate(rate);
                });
                timeServer = timeNow;
            }
        });
    }
}
