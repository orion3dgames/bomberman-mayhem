import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { PlayerInput } from "../Controllers/PlayerInput";
import { PlayerCamera } from "../Controllers/PlayerCamera";
import { PlayerUI } from "../Controllers/PlayerUI";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Animation } from "@babylonjs/core/Animations/animation";
import { GameScene } from "../Scenes/GameScene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MapHelper } from "../../../shared/MapHelper";
import { LevelGenerator } from "../Controllers/LevelGenerator";

export class Bomb extends TransformNode {
    public _camera: PlayerCamera;
    public _engine: Engine;
    public _map: MapHelper;
    public _input: PlayerInput;
    public _generator: LevelGenerator;
    public _game;
    public _entity;
    public _room;
    public _shadow;
    public _ui: PlayerUI;
    public playerMesh: Mesh;
    public isCurrentPlayer;
    public tile;

    public sessionId: string = "";
    public type: string = "";
    public name: string = "";
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    public nextScale: number;

    constructor(name: string, scene: Scene, gameScene: GameScene, entity, isCurrentPlayer = false) {
        super(name, scene);

        // set variables
        this._scene = scene;
        this._engine = gameScene._engine;
        this._map = gameScene._map;
        this._room = gameScene.room;
        this._game = gameScene._game;
        this._generator = gameScene._generator;
        this._ui = gameScene._ui;
        this._shadow = gameScene._shadow;
        this._entity = entity;
        this.isCurrentPlayer = isCurrentPlayer;

        // set entity
        Object.assign(this, entity);

        // set tile
        this.tile = this._map.findTile(this.type, "name");

        // set position
        this.setPosition();

        // spawn
        this.spawn();

        // update from server
        this._entity.onChange(() => {
            // update player data from server data
            Object.assign(this, this._entity);

            // set position
            this.setPosition();
        });
    }

    public spawn() {
        // create mesh
        let instance = this._generator.assets["bomb"].createInstance("bomb-" + this.x + "-" + this.y);
        instance.position = new Vector3(0, 0, 0);
        instance.receiveShadows = true;
        instance.parent = this;
        instance.freezeWorldMatrix();
        this.playerMesh = instance;

        // add shadow
        this._shadow.addShadowCaster(instance);

        // animation bomb scale every 60 frames
        Animation.CreateAndStartAnimation("boxscale", instance, "scale", 30, 60, 0.8, 1.2, 1);
    }

    public setPosition() {
        this.position = new Vector3(this.x, this.y, this.z);
    }

    public update(delta: number) {}

    public updateServerRate() {}

    public delete() {
        this.playerMesh.dispose();
    }
}