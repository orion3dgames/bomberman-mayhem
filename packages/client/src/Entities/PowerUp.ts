import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { Animation } from "@babylonjs/core/Animations/animation";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CellType } from "../../../shared/types";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Sound } from "@babylonjs/core/Audio/sound";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Material } from "@babylonjs/core/Materials/material";
import { Engine } from "@babylonjs/core/Engines/engine";

export class PowerUp extends TransformNode {
    public _entity;
    public _map;
    public _room;
    public _camera;
    public _entities;
    public _generator;

    public type: CellType;
    public size: number = 1;
    public tile;
    public col: number = 0;
    public row: number = 0;
    public cells: [] = [];
    public power;

    public playerMesh;

    constructor(name: string, scene: Scene, gameScene, entity) {
        super(name, scene);

        // set variables
        this._scene = scene;
        this._map = gameScene._map;
        this._room = gameScene.room;
        this._generator = gameScene._generator;
        this._entity = entity;

        // set entity
        Object.assign(this, entity);

        // set position
        this.setPosition();

        // spawn
        this.spawn();

        console.log("POWER UP CREATE", entity);
    }

    public spawn() {
        // create mesh
        let mesh = this._generator.assets["powerup"];
        let instance = mesh.clone("powerup-" + this.col + "-" + this.row);
        instance.parent = this;
        instance.material = this._scene.getMaterialByName("powerup_" + this.power);
        this.playerMesh = instance;
    }

    public update() {}

    public updateServerRate() {}

    public setPosition() {
        this.position = new Vector3(this.col, 0, this.row);
    }

    public delete() {
        if (this.playerMesh) {
            this.playerMesh.dispose();
        }
    }
}
