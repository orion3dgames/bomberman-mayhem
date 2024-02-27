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

export class Explosion extends TransformNode {
    public _generator;
    public _map;

    public playerMesh;
    public mesh1;
    public mesh2;

    public type;
    public size: number = 1;
    public tile;
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    constructor(name: string, scene: Scene, map, generator, data) {
        super(name, scene);

        // set variables
        this._scene = scene;
        this._map = map;
        this._generator = generator;

        // set entity
        Object.assign(this, data);

        // set tile
        this.tile = this._map.findTile(this.type, "name");

        // set position
        this.setPosition();

        // spawn
        this.spawn();
    }

    public spawn() {
        let minSize = this.size;
        let maxSize = this.size * 2 + 1;

        // create mesh
        let instanceX = this._generator.assets["explosion"].createInstance("exp-" + this.x + "-" + this.y);
        instanceX.position = new Vector3(0, 0, 0);
        instanceX.scaling = new Vector3(maxSize, 1, 1);
        instanceX.receiveShadows = true;
        instanceX.parent = this;
        instanceX.freezeWorldMatrix();

        // create mesh
        let instanceZ = this._generator.assets["explosion"].createInstance("exp-" + this.x + "-" + this.y);
        instanceZ.position = new Vector3(0, 0, 0);
        instanceZ.scaling = new Vector3(1, 1, maxSize);
        instanceZ.receiveShadows = true;
        instanceZ.parent = this;
        instanceZ.freezeWorldMatrix();

        this.mesh1 = instanceX;
        this.mesh2 = instanceZ;

        //Animate the bomb
        const animWheel = new Animation("wheelAnimation", "opacity", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);

        const wheelKeys = [];

        //At the animation key 0, the value of rotation.y is 0
        wheelKeys.push({
            frame: 0,
            value: 1,
        });

        //At the animation key 30
        wheelKeys.push({
            frame: 60,
            value: 0,
        });

        //set the keys
        animWheel.setKeys(wheelKeys);

        //Link this animation to a bomb
        this.mesh1.animations = [];
        this.mesh1.animations.push(animWheel);
        this._scene.beginAnimation(this.mesh1, 0, 60, false);

        //Link this animation to a bomb
        this.mesh2.animations = [];
        this.mesh2.animations.push(animWheel);
        this._scene.beginAnimation(this.mesh2, 0, 60, false);
    }

    public setPosition() {
        this.position = new Vector3(this.x, this.y, this.z);
    }

    public delete() {
        this.mesh1.dispose();
        this.mesh2.dispose();
    }
}
