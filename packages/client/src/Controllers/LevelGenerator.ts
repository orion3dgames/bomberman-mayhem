import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { MapHelper } from "../../../shared/MapHelper";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Sound } from "@babylonjs/core/Audio/sound";

export class LevelGenerator {
    private _scene: Scene;
    private _map: MapHelper;
    private _shadow: ShadowGenerator;

    public assets = [];
    private materials = [];
    private offset_x: number = 0;
    private offset_z: number = 0;

    public instances = [];
    public bombModel;
    public explosionTexture;

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

    public async loadModels() {
        let model = await SceneLoader.ImportMeshAsync("", "models/", "bomb_01.glb");
        this.bombModel = this.mergeMesh("bomb_01", model.meshes[0]);
        console.log(this.bombModel);
    }

    mergeMesh(key, mesh) {
        // pick what you want to merge
        const allChildMeshes = mesh.getChildTransformNodes(true)[0].getChildMeshes(false);

        // multiMaterial = true
        const merged = Mesh.MergeMeshes(allChildMeshes, false, true, undefined, undefined, true);
        if (merged) {
            merged.name = key + "_MergedModel";
        }
        return merged;
    }

    //
    public generateMaterials() {
        let wallTxt = new Texture("textures/wall_04.jpg", this._scene);
        let groundTxt = new Texture("textures/ground_03.jpg", this._scene);
        let wallBrokenTxt = new Texture("textures/wall_03.jpg", this._scene);
        let blastTxt = new Texture("textures/blast.png", this._scene);

        for (let tileID in this._map.tiles) {
            let tile = this._map.tiles[tileID];

            // ground or spawnpoint
            if (tile.id === " " || tile.id === "S") {
                const material = new StandardMaterial("material-ground", this._scene);
                material.diffuseTexture = groundTxt;
                material.specularColor = Color3.Black();
                this.materials[tile.name] = material;
            }

            // wall
            if (tile.id === "W") {
                const material = new StandardMaterial("material-wall", this._scene);
                material.diffuseTexture = wallTxt;
                material.specularColor = Color3.Black();
                this.materials[tile.name] = material;
            }

            // broken wall
            if (tile.id === "B") {
                const material = new StandardMaterial("material-broken", this._scene);
                material.diffuseTexture = wallBrokenTxt;
                material.specularColor = Color3.Black();
                this.materials[tile.name] = material;
            }

            // bomb
            if (tile.id === "T") {
                const material = new StandardMaterial("material-bomb", this._scene);
                material.diffuseColor = Color3.Black();
                material.specularColor = Color3.Black();
                this.materials[tile.name] = material;
            }

            // explosion
            if (tile.id === "E") {
                const material = new StandardMaterial("material-explosion", this._scene);
                material.diffuseColor = Color3.FromHexString("#bd521c");
                material.specularColor = Color3.Black();
                //material.disableLighting = true;
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

            // broken wall
            if (tile.id === "B") {
                const box = MeshBuilder.CreateBox("box-" + tile.name, { size: tile.width, height: 2 }, this._scene);
                box.position = new Vector3(0, 0, 0);
                box.material = this.materials[tile.name];
                box.isVisible = false;
                this.assets[tile.name] = box;
            }

            // bomb
            if (tile.id === "T") {
                const box = MeshBuilder.CreateBox("box-" + tile.name, { size: 1, height: 1 }, this._scene);
                box.position = new Vector3(0, 0.5, 0);
                box.material = this.materials[tile.name];
                box.isVisible = false;
                this.assets[tile.name] = box;
            }

            // explosion
            if (tile.id === "E") {
                const box = MeshBuilder.CreateSphere("box-" + tile.name, { diameter: 1 }, this._scene);
                box.position = new Vector3(0, 0.5, 0);
                box.material = this.materials[tile.name];
                box.isVisible = false;
                box.visibility = 0;
                this.assets[tile.name] = box;
            }
        }

        //
        const box = MeshBuilder.CreateSphere("powerup", { diameter: 0.5 }, this._scene);
        box.position = new Vector3(0, 0.5, 0);
        box.isEnabled(false);
        this.assets["powerup"] = box;

        var material = new StandardMaterial("powerup_0");
        material.diffuseColor = Color3.Blue();

        var material = new StandardMaterial("powerup_1");
        material.diffuseColor = Color3.Red();

        var material = new StandardMaterial("powerup_2");
        material.diffuseColor = Color3.Yellow();

        // particule
        this.explosionTexture = this._scene.getTextureByName("textures/particle_01.png");
        if (!this.explosionTexture) {
            this.explosionTexture = new Texture("textures/particle_01.png", this._scene);
        }

        var particleSystem = new ParticleSystem("particles", 1000, this._scene);
        particleSystem.particleTexture = this.explosionTexture;
        particleSystem.emitter = this.assets["explosion"]; // the starting location
        // Colors of all particles
        particleSystem.color1 = Color4.FromHexString("#f58d42");
        particleSystem.color2 = Color4.FromHexString("#ff1900");
        particleSystem.colorDead = new Color4(0, 0, 0, 1);
        // Size of each particle (random between...
        particleSystem.minSize = 0.2;
        particleSystem.maxSize = 0.4;
        // Life time of each particle (random between...
        particleSystem.minLifeTime = 0.2;
        particleSystem.maxLifeTime = 1.5;
        particleSystem.targetStopDuration = 1.5;
        // Emission rate
        particleSystem.emitRate = 1000;
        particleSystem.createSphereEmitter(0.1);
        particleSystem.updateSpeed = 0.09;
        this.assets["particleSystem"] = particleSystem;

        // LOAD SOUNDS
        let explosionSound = new Sound(
            "explosionSound",
            "./sounds/explosion.mp3",
            this._scene,
            () => {
                this.assets["explosionSound"] = explosionSound;
                console.log("SOUND LOADED", this.assets);
            },
            {
                loop: false,
                autoplay: false,
                volume: 0.1,
            }
        );
    }

    public async generateMeshes(map: string) {
        this._map.mapData.forEach((col, colId) => {
            col.forEach((tileID, rowId) => {
                //this.createInstance(tileID, colId, rowId);
            });
        });
    }

    createInstance(tileID, colId, rowId) {
        let tile = this._map.findTile(tileID);
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
                instance.freezeWorldMatrix();
                this.instances.push(instance);
            }

            // wall
            if (tile.id === "W") {
                let instance = this.assets[tile.name].createInstance("box-" + rowId + "-" + colId);
                instance.position = new Vector3(posX, offset_y, posZ);
                instance.metadata = tile;
                instance.freezeWorldMatrix();
                this._shadow.addShadowCaster(instance, true);
                this.instances.push(instance);
            }
        }
    }
}
