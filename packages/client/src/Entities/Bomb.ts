import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { PlayerInput } from "./Entity/PlayerInput";
import { PlayerCamera } from "../Controllers/PlayerCamera";
import { PlayerUI } from "../Controllers/PlayerUI";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Animation } from "@babylonjs/core/Animations/animation";
import { GameScene } from "../Scenes/GameScene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MapHelper } from "../../../shared/MapHelper";
import { LevelGenerator } from "../Controllers/LevelGenerator";
import { Explosion } from "./Explosion";
import { BounceEase, CircleEase, CubicEase, EasingFunction } from "@babylonjs/core/Animations/easing";

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
    public col: number = 0;
    public row: number = 0;
    public size: number = 1;

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
        let sizeMin = 0.6;
        let sizeMax = 1;

        // create mesh
        let mesh = this._generator.bombModel;
        let instance = mesh.createInstance("bomb-" + this.col + "-" + this.row);
        instance.scale = new Vector3(sizeMin, sizeMin, sizeMin);
        instance.position = new Vector3(0, 0, 0);
        instance.receiveShadows = true;
        instance.parent = this;
        instance.freezeWorldMatrix();
        this.playerMesh = instance;

        // add shadow
        this._shadow.addShadowCaster(instance);

        // Creating an easing function
        const easingFunction = new CubicEase();
        // For each easing function, you can choose between EASEIN (default), EASEOUT, EASEINOUT
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

        //Animate the bomb
        const animWheel = new Animation("wheelAnimation", "scaling", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);

        const wheelKeys = [];

        //At the animation key 0, the value of rotation.y is 0
        wheelKeys.push({
            frame: 0,
            value: new Vector3(sizeMin, sizeMin, sizeMin),
        });

        //At the animation key 30, (after 1 sec since animation fps = 30) the value of rotation.y is 2PI for a complete rotation
        wheelKeys.push({
            frame: 15,
            value: new Vector3(sizeMax, sizeMax, sizeMax),
        });

        //At the animation key 60
        wheelKeys.push({
            frame: 30,
            value: new Vector3(sizeMin, sizeMin, sizeMin),
        });

        //set the keys
        animWheel.setKeys(wheelKeys);
        animWheel.setEasingFunction(easingFunction);

        //Link this animation to a bomb
        instance.animations = [];
        instance.animations.push(animWheel);

        this._scene.beginAnimation(instance, 0, 60, true);
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
