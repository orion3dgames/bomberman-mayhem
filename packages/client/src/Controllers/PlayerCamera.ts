import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export class PlayerCamera {
    private _scene: Scene;
    private _cameraRoot;
    public camera;

    constructor(scene) {
        this._scene = scene;

        //set up camera
        var cameraRoot = new TransformNode("cameraRoot");
        cameraRoot.position = new Vector3(0, 1.5, 0);
        cameraRoot.rotation = new Vector3(0, 0, 0);
        this._cameraRoot = cameraRoot;

        var camYAxis = new TransformNode("camYAxis");
        camYAxis.rotation = new Vector3(1.2, 0, 0);
        camYAxis.parent = cameraRoot;

        var camera = new UniversalCamera("playercamera", new Vector3(0, 0, -45), this._scene);
        camera.lockedTarget = cameraRoot.position;
        camera.fov = 0.35;
        camera.parent = camYAxis;

        this.camera = camera;
    }

    tween(player) {
        //this._cameraRoot.position = player.position;
        this._cameraRoot.position = Vector3.Lerp(this._cameraRoot.position, new Vector3(player.position.x, player.position.y, player.position.z), 0.4);
    }
}
