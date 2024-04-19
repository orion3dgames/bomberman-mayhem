import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4 } from "@babylonjs/core/Maths/math.color";

import { GameController } from "../Controllers/GameController";
import { CellType, SceneName, ServerMsg } from "../../../shared/types";
import { MapHelper } from "../../../shared/MapHelper";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { LevelGenerator } from "../Controllers/LevelGenerator";
import { PlayerCamera } from "../Controllers/PlayerCamera";
import { Entity } from "../Entities/Entity";
import { PlayerUI } from "../Controllers/PlayerUI";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Cell } from "../Entities/Cell";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Bomb } from "../Entities/Bomb";
import { PowerUp } from "../Entities/PowerUp";
import { Explosion } from "../Entities/Explosion";
import { SkyMaterial } from "@babylonjs/materials/sky/skyMaterial";

export class GameScene {
    public _game: GameController;
    public _scene: Scene;
    public _engine: Engine;
    public _newState: SceneName;
    public _ui;
    public _environment;
    public _shadow: ShadowGenerator;
    public _map: MapHelper;
    public _generator: LevelGenerator;
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

        //
        this._game.engine.displayLoadingUI();

        // set sky color
        this._scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

        // This creates directional light with shdaows
        var light = new DirectionalLight("dir01", new Vector3(-0.25, -1, -0.25), scene);
        light.position = new Vector3(20, 40, 20);
        light.shadowEnabled = true;

        // Shadows
        var shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.filter = ShadowGenerator.FILTER_PCF;
        shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
        shadowGenerator.darkness = 0;
        this._shadow = shadowGenerator;

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var ambient = new HemisphericLight("ambient1", new Vector3(0, 1, 0), scene);
        ambient.intensity = 0.8;

        const skyMaterial = new SkyMaterial("skyMaterial", scene);
        skyMaterial.backFaceCulling = false;

        const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
        skybox.material = skyMaterial;

        // generate level
        let chosenMap = this._game.selectedMap.key;
        this._map = new MapHelper(chosenMap);
        this._generator = new LevelGenerator(this._scene, this._map, shadowGenerator);
        await this._generator.loadModels();

        // start camera
        this._camera = new PlayerCamera(this._scene);

        // setup colyseus room
        // hack for devlopement
        if (!this._game.joinedRoom) {
            let hash = window.location.hash.substring(1);
            this._game.joinedRoom = await this._game.client.createOrJoin(hash, this._game.user);
            this._game.joinedRoom.send(ServerMsg.START_GAME_REQUESTED);
        }

        // set room
        this.room = this._game.joinedRoom;
        this.sessionId = this.room.sessionId;

        // hide loading screen
        setTimeout(() => {
            this._game.engine.hideLoadingUI();
            this.startGame();
        }, 500);
    }

    startGame() {
        // start UI
        this._ui = new PlayerUI(this._scene, this._engine, this);

        ///////////////////////////////////////////////////////////////////////////
        /////////////////////////// COLYSEUS STATE

        ////////////////////// PLAYERS
        // on new player
        this.room.state.players.onAdd((entity, sessionId) => {
            console.log("[GAME] PLAYER ADDED", entity);
            let currentPlayer = sessionId === this.sessionId;
            if (currentPlayer) {
                let player = new Entity(sessionId, this._scene, this, entity, currentPlayer);
                this._ui.setCurrentPlayer(player);
                this.entities.set(sessionId, player);
            } else {
                this.entities.set(sessionId, new Entity(sessionId, this._scene, this, entity, currentPlayer));
            }
        });
        this.room.state.players.onRemove((entity, sessionId) => {
            console.log("[GAME] PLAYER LEFT", entity);
            if (this.entities.get(sessionId)) {
                this.entities.get(sessionId).delete();
            }
            this.entities.delete(sessionId);
        });

        ////////////////////// CELLS
        // on new entity
        this.room.state.cells.onAdd((entity, sessionId) => {
            this.entities.set(sessionId, new Cell(sessionId, this._scene, this, entity));
        });
        this.room.state.cells.onRemove((entity, sessionId) => {
            if (this.entities.get(sessionId)) {
                this.entities.get(sessionId).delete();
            }
            this.entities.delete(sessionId);
        });

        ////////////////////// BOMBS
        // on new entity
        this.room.state.bombs.onAdd((entity, sessionId) => {
            this.entities.set(sessionId, new Bomb(sessionId, this._scene, this, entity));
        });
        this.room.state.bombs.onRemove((entity, sessionId) => {
            setTimeout(() => {
                if (this.entities.get(sessionId)) {
                    this.entities.get(sessionId).delete();
                }
                this.entities.delete(sessionId);
            }, 200);
        });

        ////////////////////// POWER UPS
        // on new entity
        this.room.state.powers.onAdd((entity, sessionId) => {
            this.entities.set(sessionId, new PowerUp(sessionId, this._scene, this, entity));
        });
        this.room.state.powers.onRemove((entity, sessionId) => {
            if (this.entities.get(sessionId)) {
                this.entities.get(sessionId).delete();
            }
            this.entities.delete(sessionId);
        });

        ////////////////////// END COLYSEUS STATE
        /////////////////////////////////////////////////////////////////////////////

        this.room.onMessage(ServerMsg.DO_EXPLOSION, (message) => {
            console.log(ServerMsg[ServerMsg.DO_EXPLOSION], message);
            let exp = new Explosion("explosion", this._scene, this._map, this._generator, this.entities, this._camera, message);
            setTimeout(() => {
                exp.delete();
            }, 1000);
        });

        // start game event
        this.room.onMessage(ServerMsg.START_GAME, (message) => {
            console.log(ServerMsg[ServerMsg.START_GAME], message);
        });

        ////////////////////////////////////////////////////
        // main game loop

        const lastUpdates = {
            SERVER: Date.now(),
            SLOW: Date.now(),
            PING: Date.now(),
        };

        this._scene.registerBeforeRender(() => {
            let delta = this._engine.getFps();
            const currentTime = Date.now();

            // game update loop
            this.entities.forEach((entity) => {
                // 60 fps
                entity.update(delta);

                // server rate
                if (currentTime - lastUpdates["SERVER"] >= 100) {
                    entity.updateServerRate(100);
                }

                // slow rate
                if (currentTime - lastUpdates["SLOW"] >= 100) {
                    entity.updateServerRate(100);
                }
            });

            // reset timers for entities
            if (currentTime - lastUpdates["SERVER"] >= 100) {
                lastUpdates["SERVER"] = currentTime;
            }
            if (currentTime - lastUpdates["SLOW"] >= 1000) {
                lastUpdates["SLOW"] = currentTime;
            }

            // game update loop
            if (currentTime - lastUpdates["PING"] >= 1000) {
                // send ping to server
                this.room.send(ServerMsg.PING);
                lastUpdates["PING"] = currentTime;
            }
        });
    }
}
