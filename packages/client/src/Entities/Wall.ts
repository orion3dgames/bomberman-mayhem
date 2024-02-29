import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { PlayerInput } from "../Controllers/PlayerInput";
import { PlayerCamera } from "../Controllers/PlayerCamera";
import { PlayerUI } from "../Controllers/PlayerUI";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GameScene } from "../Scenes/GameScene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MapHelper } from "../../../shared/MapHelper";
import { LevelGenerator } from "../Controllers/LevelGenerator";
import tiles from "../../../shared/Data/tiles.json";

export class Wall extends TransformNode {
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
    public col: number = 0;
    public row: number = 0;

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
        console.log("spawn", this);
        // create instance
        let instance = this._generator.assets["breakable_wall"].createInstance("box-" + this.col + "-" + this.row);
        instance.position = new Vector3(0, 0, 0);
        instance.receiveShadows = true;
        instance.parent = this;
        instance.freezeWorldMatrix();
        this.playerMesh = instance;

        // add player shadow
        this._shadow.addShadowCaster(instance);
    }

    public setPosition() {
        this.position = new Vector3(this.col, 0, this.row);
    }

    public update(delta: number) {}

    public updateServerRate() {}

    public delete() {
        this.playerMesh.dispose();
    }
}
