import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { LevelGenerator } from "../Controllers/LevelGenerator";
import { PlayerInput } from "../Controllers/PlayerInput";
import { PlayerCamera } from "../Controllers/PlayerCamera";
import { PlayerUI } from "../Controllers/PlayerUI";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GameScene } from "../Scenes/GameScene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

export class Entity extends TransformNode {
    public _camera: PlayerCamera;
    public _engine: Engine;
    public _map: LevelGenerator;
    public _input: PlayerInput;
    public _game;
    public _entity;
    public _room;
    public _ui: PlayerUI;
    public playerMesh: Mesh;
    public isCurrentPlayer;

    public characterLabel;

    public sessionId: string = "";
    public name: string = "";
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    constructor(name: string, scene: Scene, gameScene: GameScene, entity, isCurrentPlayer = false) {
        super(name, scene);

        // set variables
        this._scene = scene;
        this._engine = gameScene._engine;
        this._map = gameScene._map;
        this._room = gameScene.room;
        this._game = gameScene._game;
        this._ui = gameScene._ui;
        this._entity = entity;
        this.isCurrentPlayer = isCurrentPlayer;

        //
        // set entity
        Object.assign(this, entity);

        // if current player
        if (isCurrentPlayer) {
            // set inputs
            this._input = new PlayerInput(this);
            this._camera = gameScene._camera;
        }

        // spawn player
        this.spawn();

        // update from server
        this._entity.onChange(() => {
            console.log("[CHANGE FROM SERVER]", this._entity);
            // update player data from server data
            Object.assign(this, this._entity);
        });

        // show entoty label
        this.characterLabel = this._ui.createEntityLabel(this);
    }

    public spawn() {
        let colors = [Color3.Red(), Color3.Blue(), Color3.Black(), Color3.White()];
        this.position = new Vector3(this.x, this.y, this.z);

        const box = MeshBuilder.CreateBox("box", { size: 0.7 }, this._scene);
        const material = new StandardMaterial("box-material", this._scene);
        material.diffuseColor = Color3.Red();
        box.material = material;
        box.parent = this;
        this.playerMesh = box;
    }

    public update(delta: number) {
        this.move();

        // only for current player
        if (this.isCurrentPlayer) {
            this._camera.tween(this);
        }
    }

    public updateServerRate(delta: number) {}

    public move() {
        //
        this.position = new Vector3(this.x, 0, this.z);

        /*
        if (this._input.player_can_move) {
            let speed = 0.1;
            let oldX = this.playerMesh.position.x;
            let oldZ = this.playerMesh.position.z;

            let x = oldX - this._input.horizontal * speed;
            let z = oldZ - this._input.vertical * speed;

            // check if allowed
            let nextPositionKey = x + "," + z;
            if (!this._generator.walkableArea[nextPositionKey]) {
                console.log("Movement not allowed", x, z);
                //return false;
            }

            //
            this.playerMesh.position = new Vector3(x, 0, z);
            console.log(x, z);
        }*/
    }
}
