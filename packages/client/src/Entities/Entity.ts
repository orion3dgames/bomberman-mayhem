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
import { MoveController } from "./Entity/MoveController";

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

    public moveController: MoveController;

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

        // move controller
        this.moveController = new MoveController(this);

        // set default position
        this.moveController.setPositionAndRotation(entity); // set next default position from server entity

        // update from server
        this._entity.onChange(() => {
            // update player data from server data
            Object.assign(this, this._entity);

            // update player position
            this.moveController.setPositionAndRotation(this._entity);

            // do server reconciliation on client if current player only & not blocked
            if (this.isCurrentPlayer) {
                this.moveController.reconcileMove(this._entity.sequence); // set default entity position
            }
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
        // tween entity
        if (this && this.moveController) {
            this.moveController.tween();
        }

        // only for current player
        if (this.isCurrentPlayer) {
            this._camera.tween(this);
        }
    }

    public updateServerRate() {
        // process player movement
        if (this.isCurrentPlayer) {
            this.moveController.processMove();
        }
    }
}
