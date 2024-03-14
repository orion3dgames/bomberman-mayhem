import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { Animation } from "@babylonjs/core/Animations/animation";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CellType } from "../../../shared/types";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Sound } from "@babylonjs/core/Audio/sound";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Material } from "@babylonjs/core/Materials/material";
import { Engine } from "@babylonjs/core/Engines/engine";

export class Explosion extends TransformNode {
    public _generator;
    public _map;
    public _room;
    public _camera;
    public _entities;

    public playerMesh;
    public mesh1;
    public mesh2;

    public type: CellType;
    public size: number = 1;
    public tile;
    public col: number = 0;
    public row: number = 0;
    public cells: [] = [];

    public texture;
    public animWheel;
    public decals = [];

    constructor(name: string, scene: Scene, map, generator, entities, camera, data) {
        super(name, scene);

        // set variables
        this._entities = entities;
        this._scene = scene;
        this._map = map;
        this._generator = generator;
        this._camera = camera;

        // set entity
        Object.assign(this, data);

        // set tile
        this.tile = this._map.findTile(this.type, "name");

        // set position
        this.setPosition();

        // spawn
        this.spawn();
    }

    public spawn() {
        // add camera shake
        this._camera.shake();

        // for every direction
        for (let x in this.cells) {
            let dir = this.cells[x] as any;
            let row = dir.row;
            let col = dir.col;

            // show explosion
            let newRow = row - this.row;
            let newCol = col - this.col;

            // create explosion emitter
            let instance = this._generator.assets["explosion"].createInstance("exp-" + row + "-" + col);
            instance.position = new Vector3(newCol, 0, newRow);
            instance.parent = this;
            instance.isVisible = true;

            // add particule system
            var particleSystem = this._generator.assets["particleSystem"].clone();
            particleSystem.emitter = instance; // the starting location
            particleSystem.start();

            // add decal
            /*
            newRow = row;
            newCol = col;
            let cell = this._entities.get(newRow + "-" + newCol);
            let decal;
            console.log("LOOKING FOR CELL", newRow + "-" + newCol);
            if (cell) {
                console.log("ADDING DECAL AT", cell.id);
                // adding decal
                let decalMaterial = this._scene.getMaterialByName("explosionDecal") as StandardMaterial;
                if (!decalMaterial) {
                    decalMaterial = new StandardMaterial("explosionDecal");
                    decalMaterial.diffuseColor = new Color3(0, 0, 0);
                    decalMaterial.specularColor = Color3.Black();
                    decalMaterial.opacityTexture = new Texture("textures/blast_opacity.png");
                }

                decal = MeshBuilder.CreateGround("decal", { width: 1, height: 1 });
                decal.position = cell.position;
                decal.position.y += 0.05;
                decal.material = decalMaterial;

                //Animate the bomb
                const animWheel = new Animation("wheelAnimation", "visibility", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
                const wheelKeys = [];
                wheelKeys.push({ frame: 0, value: 1 });
                wheelKeys.push({ frame: 60, value: 0 });
                wheelKeys.push({ frame: 120, value: 1 });
                animWheel.setKeys(wheelKeys);
                instance.animations = [];
                instance.animations.push(animWheel);
                console.log("DECAL STARTED");
                this._scene.beginAnimation(decal, 0, 600, true, 1, () => {
                    console.log("DECAL FINISHED");
                    //decal.dispose();
                });
            }
            */

            // play epxlosion sound
            //this._generator.assets["explosionSound"].setPosition(new Vector3(newRow, 0, newCol));
            //this._generator.assets["explosionSound"].setVolume(0.1);
            //this._generator.assets["explosionSound"].play();

            // remove
            setTimeout(() => {
                //decal.dispose();
                particleSystem.dispose(true);
                instance.dispose();
            }, 2000);
        }
    }

    // obsolete???
    public _spawn() {
        const dirs = [
            {
                // up
                col: -1,
                row: 0,
                direction: "left",
            },
            {
                // down
                col: 1,
                row: 0,
                direction: "righ",
            },
            {
                // left
                col: 0,
                row: -1,
                direction: "down",
            },
            {
                // right
                col: 0,
                row: 1,
                direction: "up",
            },
        ];
        let addedMiddleCell = false;

        // add camera shake
        this._camera.shake();

        // for every direction
        dirs.forEach((dir) => {
            // for distance
            for (let i = 0; i <= this.size; i++) {
                const col = this.col + dir.col * i;
                const row = this.row + dir.row * i;

                // get cell
                const cell = this._room.state.cells.get(row + "-" + col);

                // dont show explosion on hard walls
                if (cell.type === CellType.WALL) {
                    console.log("--> is a wall, return");
                    return;
                }

                // dont show explosion on soft walls
                if (cell.type === CellType.BREAKABLE_WALL) {
                    console.log("--> is a breakable wall, return");
                    return;
                }

                if (i === 0 && addedMiddleCell) {
                    console.log("--> already added the middle cell");
                    continue;
                }

                // show explosion
                let newRow = row - this.row;
                let newCol = col - this.col;
                console.log("--> add explosion", newRow, newCol);
                let instance = this._generator.assets["explosion"].clone("exp-" + row + "-" + col);
                instance.position = new Vector3(newCol, 0, newRow);
                instance.receiveShadows = true;
                instance.parent = this;
                instance.isVisible = true;

                //Animate the bomb
                instance.animations = [];
                instance.animations.push(this.animWheel);
                this._scene.beginAnimation(instance, 0, 60, true);

                // add particule system
                //////////////////////////////////////////////
                // create a particle system
                var particleSystem = new ParticleSystem("particles", 1000, this._scene);
                particleSystem.particleTexture = this.texture;
                particleSystem.emitter = instance; // the starting location
                // Colors of all particles
                particleSystem.color1 = Color4.FromHexString("#f58d42");
                particleSystem.color2 = Color4.FromHexString("#ff1900");
                particleSystem.colorDead = new Color4(0, 0, 0, 1);
                // Size of each particle (random between...
                particleSystem.minSize = 0.3;
                particleSystem.maxSize = 0.6;
                // Life time of each particle (random between...
                particleSystem.minLifeTime = 1;
                particleSystem.maxLifeTime = 1.5;
                particleSystem.targetStopDuration = 1.5;
                // Emission rate
                particleSystem.emitRate = 1000;
                particleSystem.createSphereEmitter(1);

                particleSystem.updateSpeed = 0.1;
                // Start the particle system
                particleSystem.start();
                //////////////////////////////////////////////

                setTimeout(() => {
                    particleSystem.dispose(true);
                }, 1000);

                //
                if (i === 0 && !addedMiddleCell) {
                    addedMiddleCell = true;
                }
            }
        });
    }

    public setPosition() {
        this.position = new Vector3(this.col, 0, this.row);
    }

    public delete() {}
}
