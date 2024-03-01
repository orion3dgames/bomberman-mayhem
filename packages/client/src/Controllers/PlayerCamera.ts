import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export class PlayerCamera {
    private _scene: Scene;
    private _cameraRoot;
    public camera: UniversalCamera;

    public shakeTimer;
    public shouldShake: boolean = false;

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

    shake() {
        this.shouldShake = true;
        var projectionMatrix = this.camera.getProjectionMatrix();
        var r = projectionMatrix.getRow(3);
        var t = 0;
        this._scene.registerBeforeRender(() => {
            if (this.shouldShake === true) {
                r.x += Math.cos(t) * 0.3;
                r.y += Math.sin(t) * 0.3;
                projectionMatrix.setRowFromFloats(3, r.x, r.y, r.z, r.w);
                t += 81337.18;
            }
        });

        this.shakeTimer = setTimeout(() => {
            this.shouldShake = false;
        }, 300);
    }

    tween(player) {
        //this._cameraRoot.position = player.position;
        this._cameraRoot.position = Vector3.Lerp(this._cameraRoot.position, new Vector3(player.position.x, player.position.y, player.position.z), 0.4);
    }
}
