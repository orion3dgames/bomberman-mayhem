import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";

import { map_01 } from "../../../shared/Maps";
import { tiles, Tile } from "../../../shared/Maps/tiles";

export class LevelGenerator {
    private _scene: Scene;
    private maps = [];
    private tiles = [];
    public spawnPoint: any = [];
    public cells: any = [];

    constructor(scene: Scene, map: string = "map_01") {
        //
        this._scene = scene;

        //
        this.maps["map_01"] = map_01;
        this.tiles = tiles;

        // generate level
        this.generate(map);
    }

    public async generate(map: string) {
        let mapArray = this.maps[map] ?? [];
        console.log("[GENERATOR] map to be generated: ", this.maps[map]);
        mapArray.forEach((row, rowId) => {
            row.forEach((col, colId) => {
                col.forEach((subcol, subcolId) => {
                    this.mesh(subcol, rowId, colId);
                });
            });
        });
    }

    mesh(tile, rowId, colId) {
        let foundTile = this.tiles[tile] as Tile;
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
