import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4 } from "@babylonjs/core/Maths/math.color";

import { GameController } from "../Controllers/GameController";
import { SceneName, ServerMsg } from "../../../shared/types";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { LevelGenerator } from "../Controllers/LevelGenerator";
import { PlayerCamera } from "../Controllers/PlayerCamera";
import { Entity } from "../Entities/Entity";
import { PlayerUI } from "../Controllers/PlayerUI";

export class GameScene {
    public _game: GameController;
    public _scene: Scene;
    public _engine: Engine;
    public _newState: SceneName;
    public _ui;
    public _environment;
    public _shadow;
    public _map: LevelGenerator;
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
        this._map = new LevelGenerator(this._scene, "map_01");

        // start camera
        this._camera = new PlayerCamera(this._scene);

        // start UI
        this._ui = new PlayerUI(this._scene, this._engine, this);

        // setup colyseus room
        // hack for devlopement
        if (!this._game.joinedRoom) {
            let hash = window.location.hash.substring(1);
            this._game.joinedRoom = await this._game.client.createOrJoin(hash, this._game.user);
        }

        // set room
        this.room = this._game.joinedRoom;
        this.sessionId = this.room.sessionId;

        // on new player
        this.room.state.players.onAdd((entity, sessionId) => {
            console.log("[GAME] ENTITY ADDED", entity);
            let currentPlayer = sessionId === this.sessionId;
            if (currentPlayer) {
                let player = new Entity(sessionId, this._scene, this, entity, currentPlayer);
                this._ui.setCurrentPlayer(player);
                this.entities.set(sessionId, player);
            } else {
                this.entities.set(sessionId, new Entity(sessionId, this._scene, this, entity, currentPlayer));
            }
        });

        // removing player
        this.room.state.players.onRemove((entity, sessionId) => {
            console.log("[GAME] ENTITY LEFT", sessionId);

            this.entities.delete(sessionId);
        });

        // start game event
        this.room.onMessage(ServerMsg.START_GAME, (message) => {
            console.log("message received from server", message);
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
            let rate = 100;
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
