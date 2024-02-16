import { Scene } from "@babylonjs/core/scene";
import { Entity } from "../Entities/Entity";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { GameController } from "../MyFirstScene";

export class PlayerCamera {
    private _scene: Scene;
    private _cameraRoot;

    constructor(game: GameController) {
        this._scene = game.scene;

        //set up camera
        var cameraRoot = new TransformNode("cameraRoot");
        cameraRoot.position = new Vector3(0, 0, 0);
        cameraRoot.rotation = new Vector3(0, 0, 0);
        this._cameraRoot = cameraRoot;

        var camYAxis = new TransformNode("camYAxis");
        camYAxis.rotation = new Vector3(0, 0, 0);
        camYAxis.parent = cameraRoot;

        var camera = new UniversalCamera("playercamera", new Vector3(0, 30, 0), this._scene);
        camera.rotation = new Vector3(1.5, 0, 0);
        camera.fov = 0.6;
        camera.parent = camYAxis;
    }

    tween(player) {
        //this._cameraRoot.position = player.position;
        this._cameraRoot.position = Vector3.Lerp(this._cameraRoot.position, new Vector3(player.position.x, player.position.y, player.position.z), 0.4);
    }
}
