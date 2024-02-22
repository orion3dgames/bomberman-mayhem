import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { MapHelper } from "../../../shared/MapHelper";
import { Tile } from "../../../shared/Maps/tiles";

export class LevelGenerator {
    private _scene: Scene;
    private _map: MapHelper;

    constructor(scene: Scene, map: MapHelper) {
        //
        this._scene = scene;
        this._map = map;

        // generate level
        this.generate(this._map.mapData);
    }

    public async generate(map: string) {
        this._map.mapData.forEach((row, rowId) => {
            row.forEach((col, colId) => {
                col.forEach((subcol, subcolId) => {
                    this.mesh(subcol, rowId, colId);
                });
            });
        });
    }

    mesh(tile, rowId, colId) {
        let foundTile = this._map.tiles[tile] as Tile;
        if (foundTile) {
            if (foundTile.id == 1) {
                const box = MeshBuilder.CreateBox("box", { size: foundTile.width, height: 0.1 }, this._scene);
                box.position = new Vector3(rowId, 0, colId);
                const material = new StandardMaterial("box-material", this._scene);
                material.diffuseColor = Color3.White();
                box.material = material;
            } else {
                const box = MeshBuilder.CreateBox("box-" + rowId + "-" + colId, { size: foundTile.width, height: foundTile.height }, this._scene);
                box.position = new Vector3(rowId, 0, colId);
                const material = new StandardMaterial("box-material", this._scene);
                material.diffuseColor = Color3.Yellow();
                box.material = material;
            }
        }
    }
}
