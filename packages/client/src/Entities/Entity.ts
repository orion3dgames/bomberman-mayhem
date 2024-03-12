import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { PlayerInput } from "./Entity/PlayerInput";
import { PlayerCamera } from "../Controllers/PlayerCamera";
import { PlayerUI } from "../Controllers/PlayerUI";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GameScene } from "../Scenes/GameScene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MoveController } from "./Entity/MoveController";
import { MapHelper } from "../../../shared/MapHelper";
import { ServerMsg } from "../../../shared/types";
import { AxesViewer } from "@babylonjs/core/Debug/axesViewer";

export class Entity extends TransformNode {
    public _camera: PlayerCamera;
    public _engine: Engine;
    public _map: MapHelper;
    public _input: PlayerInput;
    public _game;
    public _entity;
    public _room;
    public _shadow;
    public _ui: PlayerUI;
    public playerMesh: Mesh;
    public isCurrentPlayer;
    public tile;
    public characterLabel;
    public moveController: MoveController;
    public _entities;

    public sessionId: string = "";
    public type;
    public name: string = "";
    public col: number = 0;
    public row: number = 0;
    public bombs: number = 0;
    public health: number = 0;
    public color: string = "#000000";

    constructor(name: string, scene: Scene, gameScene: GameScene, entity, isCurrentPlayer = false) {
        super(name, scene);

        // set variables
        this._scene = scene;
        this._engine = gameScene._engine;
        this._map = gameScene._map;
        this._room = gameScene.room;
        this._game = gameScene._game;
        this._ui = gameScene._ui;
        this._shadow = gameScene._shadow;
        this._entities = gameScene.entities;
        this._entity = entity;
        this.isCurrentPlayer = isCurrentPlayer;

        // set entity
        Object.assign(this, entity);

        // set tile
        this.tile = this._map.findTile(this.type, "name");

        // spawn player
        this.spawn();

        // move controller
        this.moveController = new MoveController(this);

        // if current player
        if (isCurrentPlayer) {
            // set inputs
            this._input = new PlayerInput(this);
            this._camera = gameScene._camera;
        }

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
                //this.moveController.reconcileMove(this._entity.sequence); // set default entity position
            }
        });

        // show entoty label
        //this.characterLabel = this._ui.createEntityLabel(this);
    }

    public spawn() {
        // square
        let boxSize = 0.6;
        const box = MeshBuilder.CreateBox("box", { size: boxSize }, this._scene);
        box.position = new Vector3(0, boxSize / 2, 0);
        const material = new StandardMaterial("box-material", this._scene);
        material.diffuseColor = Color3.FromHexString(this.color);
        material.specularColor = Color3.Black();
        box.material = material;
        box.parent = this;
        this.playerMesh = box;

        // add player shadow
        this._shadow.addShadowCaster(box);
    }

    public update(delta: number) {
        // tween entity
        if (this && this.moveController) {
            //this.moveController.tween();
        }

        // only for current player
        if (this.isCurrentPlayer) {
            this._camera.tween(this);
        }
    }

    public updateServerRate() {
        // process player movement
        if (this.isCurrentPlayer) {
            //
            //this.moveController.processMove();

            // if
            if (this._input.space_pressed === true) {
                this._room.send(ServerMsg.PLACE_BOMB);
                this._input.space_pressed = false;
            }
        }
    }

    public isTileAvailable(x, z) {
        for (let [key, element] of this._entities) {
            if (element._entity.col === x && element._entity.row === z) {
                return false;
            }
        }
        return true;
    }

    public delete() {
        if (this.playerMesh) {
            this.playerMesh.dispose();
        }
        if (this.characterLabel) {
            this.characterLabel.dispose();
        }
    }
}
