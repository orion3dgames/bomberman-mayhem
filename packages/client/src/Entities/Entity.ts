import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { LevelController } from "../Controllers/LevelController";
import { PlayerInput } from "../Controllers/PlayerInput";
import { Mesh, TransformNode } from "@babylonjs/core";
import { PlayerCamera } from "../Controllers/PlayerCamera";
import { PlayerUI } from "../Controllers/PlayerUI";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GameScene } from "../Scenes/GameScene";

export class Entity extends TransformNode {
    public _camera: PlayerCamera;
    public _engine: Engine;
    public _generator: LevelController;
    public _input: PlayerInput;
    public _game;
    public _room;
    public _playerUI: PlayerUI;
    public playerMesh: Mesh;

    public characterLabel;

    public sessionId: string = "";
    public name: string = "";
    public row: number = 0;
    public col: number = 0;

    constructor(name: string, scene: Scene, gameScene: GameScene, data, isCurrentPlayer = false) {
        super(name, scene);

        // set variables
        this._scene = scene;
        this._engine = gameScene._engine;
        this._generator = gameScene._generator;
        this._room = gameScene.room;

        //
        this.sessionId = data.sessionId;
        this.name = data.displayName ?? "ERROR";
        console.log(data);

        // if current player, monito inputs
        if (isCurrentPlayer) {
            this._input = new PlayerInput(this);
            this._camera = gameScene._camera;
            this._playerUI = new PlayerUI(this._scene, this._engine, this);
        }

        // spawn player
        this.spawn();

        // show entoty label
        this.characterLabel = this._playerUI.createEntityLabel(this);
    }

    public spawn() {
        let colors = [Color3.Red(), Color3.Blue(), Color3.Black(), Color3.White()];
        let spawnPoint = this._generator.getAvailableSpawnPoint();
        this.position = spawnPoint.position;
        this.row = this.position.x;
        this.col = this.position.z;

        const box = MeshBuilder.CreateBox("box", { size: 0.7 }, this._scene);
        const material = new StandardMaterial("box-material", this._scene);
        material.diffuseColor = Color3.Red();
        box.material = material;
        box.parent = this;
        this.playerMesh = box;
    }

    public update(delta: number) {
        this.move();
        this._camera.tween(this);
    }

    public updateServerRate(delta: number) {}

    public move() {
        //
        this.position = new Vector3(this.row, 0, this.col);

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
