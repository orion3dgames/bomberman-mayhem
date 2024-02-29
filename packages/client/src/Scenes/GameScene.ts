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
import { Explosion } from "../Entities/Explosion";

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
        shadowGenerator.darkness = 0.3;
        this._shadow = shadowGenerator;

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var ambient = new HemisphericLight("ambient1", new Vector3(0, 1, 0), scene);
        ambient.intensity = 0.5;

        // generate level
        let chosenMap = this._game.selectedMap.key;
        this._map = new MapHelper(chosenMap);
        this._generator = new LevelGenerator(this._scene, this._map, shadowGenerator);

        // start camera
        this._camera = new PlayerCamera(this._scene);

        // start UI
        this._ui = new PlayerUI(this._scene, this._engine, this);

        //
        const plane = MeshBuilder.CreatePlane("plane", { width: 2, height: 2 }, scene);

        // setup colyseus room
        // hack for devlopement
        if (!this._game.joinedRoom) {
            let hash = window.location.hash.substring(1);
            this._game.joinedRoom = await this._game.client.createOrJoin(hash, this._game.user);
            this._game.joinedRoom.send(ServerMsg.START_GAME_REQUESTED);
        }

        // hide loading screen
        setTimeout(() => {
            this._game.engine.hideLoadingUI();
        }, 1000);

        // set room
        this.room = this._game.joinedRoom;
        this.sessionId = this.room.sessionId;

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

        // removing player
        this.room.state.players.onRemove((entity, sessionId) => {
            console.log("[GAME] PLAYER LEFT", entity);
            this.entities.get(sessionId).delete();
            this.entities.delete(sessionId);
        });

        ////////////////////// CELLS
        // on new entity
        this.room.state.cells.onAdd((entity, sessionId) => {
            this.entities.set(sessionId, new Cell(sessionId, this._scene, this, entity));
        });
        this.room.state.cells.onRemove((entity, sessionId) => {
            this.entities.get(sessionId).delete();
            this.entities.delete(sessionId);
        });

        ////////////////////// BOMBS
        // on new entity
        this.room.state.bombs.onAdd((entity, sessionId) => {
            this.entities.set(sessionId, new Bomb(sessionId, this._scene, this, entity));
        });
        this.room.state.bombs.onRemove((entity, sessionId) => {
            // leave an explosion effect
            let exp = new Explosion("explosion", this._scene, this._map, this._generator, this.room, {
                type: "explosion",
                col: entity.col,
                row: entity.row,
                size: entity.size,
            });
            setTimeout(() => {
                exp.delete();
                exp.dispose();
            }, 1000);

            //
            this.entities.get(sessionId).delete();

            //
            this.entities.delete(sessionId);
        });

        ////////////////////// END COLYSEUS STATE
        /////////////////////////////////////////////////////////////////////////////

        // start game event
        this.room.onMessage(ServerMsg.START_GAME, (message) => {
            console.log("message received from server", message);
        });

        // game loop
        let timeServer = Date.now();
        this._scene.registerBeforeRender(() => {
            let delta = this._engine.getFps();
            let timeNow = Date.now();

            // update game state first
            /*
            this._map.cells = [...this._map.baseCells];
            this.entities.forEach((entity) => {
                if (this._map.cells[entity.x][entity.z] && entity.tile && this._map.cells[entity.x][entity.z] !== entity.tile) {
                    console.log("UPDATE CELL", this._map.cells);
                    this._map.cells[entity.x][entity.z] = entity.tile;
                }
            });*/

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
