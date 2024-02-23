import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { MapHelper } from "../../../shared/MapHelper";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Tile } from "../../../shared/types";

export class LevelGenerator {
    private _scene: Scene;
    private _map: MapHelper;
    private _shadow: ShadowGenerator;

    private assets = [];
    private materials = [];
    private offset_x: number = 0;
    private offset_z: number = 0;

    public instances = [];

    constructor(scene: Scene, map: MapHelper, shadow: ShadowGenerator) {
        //
        this._scene = scene;
        this._map = map;
        this._shadow = shadow;

        // create materials first
        this.generateMaterials();

        // create models first
        this.generateTiles();

        // generate level
        this.generateMeshes(this._map.mapData);
    }

    //
    public generateMaterials() {
        let wallTxt = new Texture("textures/wall_02.jpg", this._scene);
        let groundTxt = new Texture("textures/ground_01.jpg", this._scene);

        for (let tileID in this._map.tiles) {
            let tile = this._map.tiles[tileID];

            // ground or spawnpoint
            if (tile.id === " " || tile.id === "S") {
                const material = new StandardMaterial("box-material", this._scene);
                material.diffuseTexture = groundTxt;
                material.specularColor = Color3.Black();
                this.materials[tile.name] = material;
            }

            // wall
            if (tile.id === "W") {
                const material = new StandardMaterial("box-material", this._scene);
                material.diffuseTexture = wallTxt;
                material.specularColor = Color3.Black();
                this.materials[tile.name] = material;
            }
        }
    }

    public generateTiles() {
        for (let tileID in this._map.tiles) {
            let tile = this._map.tiles[tileID];

            // ground or spawnpoint
            if (tile.id === " " || tile.id === "S") {
                const box = MeshBuilder.CreateBox("box-" + tile.name, { size: tile.width, height: 0.1 }, this._scene);
                box.position = new Vector3(0, 0, 0);
                box.material = this.materials[tile.name];
                box.receiveShadows = true;
                box.isVisible = false;
                this.assets[tile.name] = box;
            }

            // wall
            if (tile.id === "W") {
                const box = MeshBuilder.CreateBox("box-" + tile.name, { size: tile.width, height: 2 }, this._scene);
                box.position = new Vector3(0, 0, 0);
                box.material = this.materials[tile.name];
                box.isVisible = false;
                this.assets[tile.name] = box;
            }
        }
    }

    public async generateMeshes(map: string) {
        this._map.mapData.forEach((col, colId) => {
            col.forEach((tileID, rowId) => {
                this.createInstance(tileID, colId, rowId);
            });
        });
    }

    createInstance(tileID, colId, rowId) {
        let tile = this._map.tiles[tileID] as Tile;
        if (tile) {
            let posX = rowId - this.offset_x;
            let posZ = colId - this.offset_z;
            let offset_y = tile.offset_y ?? 0;
            // ground
            if (tile.id === " " || tile.id === "S") {
                let instance = this.assets[tile.name].createInstance("box-" + rowId + "-" + colId);
                instance.position = new Vector3(posX, offset_y, posZ);
                instance.metadata = tile;
                instance.receiveShadows = true;
                this.instances.push(instance);
            }

            // wall
            if (tile.id === "W") {
                let instance = this.assets[tile.name].createInstance("box-" + rowId + "-" + colId);
                instance.position = new Vector3(posX, offset_y, posZ);
                instance.metadata = tile;
                this._shadow.addShadowCaster(instance, true);
                this.instances.push(instance);
            }
        }
    }
}
