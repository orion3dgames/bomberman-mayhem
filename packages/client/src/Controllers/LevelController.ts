import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";

import { map_01 } from "../Maps";
import { tiles, Tile } from "../Maps/tiles";

export class LevelController {
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

        //
        console.log(this.cells);
    }

    public getAvailableSpawnPoint() {
        return this.spawnPoint[0];
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
        let colors = [Color3.Red(), Color3.Blue(), Color3.Black(), Color3.White()];
        let foundTile = this.tiles[tile] as Tile;
        if (foundTile) {
            // spawn point
            if (foundTile.id == 1) {
                this.spawnPoint.push({
                    position: new Vector3(rowId, 0, colId),
                });

                //
                const box = MeshBuilder.CreateBox("box", { size: foundTile.width, height: 0.1 }, this._scene);
                box.position = new Vector3(rowId, 0, colId);
                const material = new StandardMaterial("box-material", this._scene);
                material.diffuseColor = Color3.White();
                box.material = material;
            } else {
                //
                const box = MeshBuilder.CreateBox("box-" + rowId + "-" + colId, { size: foundTile.width, height: foundTile.height }, this._scene);
                box.position = new Vector3(rowId, 0, colId);
                const material = new StandardMaterial("box-material", this._scene);
                material.diffuseColor = foundTile.color;
                box.material = material;
            }

            //
            if (!foundTile.isWalkable) {
                if (!this.cells[rowId]) {
                    this.cells[rowId] = [];
                }
                this.cells[rowId][colId] = foundTile.id;
            }
        }
    }
}
