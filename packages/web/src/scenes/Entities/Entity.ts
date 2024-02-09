import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";

export class Entity {
    private _scene: Scene;

    constructor(scene: Scene) {
        //
        this._scene = scene;

        // spawn player
        this.spawn();
    }

    public async spawn() {
        let colors = [Color3.Red(), Color3.Blue(), Color3.Black(), Color3.White()];

        const box = MeshBuilder.CreateBox("box", { size: 1 }, this._scene);
        box.position = new Vector3(Math.random() * 5, 0, Math.random() * 5);
        const material = new StandardMaterial("box-material", this._scene);
        material.diffuseColor = colors[Math.floor(Math.random() * colors.length)];
        box.material = material;
    }
}
