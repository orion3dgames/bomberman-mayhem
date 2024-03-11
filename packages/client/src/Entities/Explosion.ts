import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { Animation } from "@babylonjs/core/Animations/animation";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CellType } from "../../../shared/types";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Sound } from "@babylonjs/core/Audio/sound";

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
            let cell = this._entities.get(newRow + "-" + newCol);
            if (cell && cell.type === "ground") {
                cell.visibility = 0.5;
                setTimeout(() => {
                    cell.visibility = 1;
                }, 1000);
            }

            // play epxlosion sound
            //this._generator.assets["explosionSound"].setPosition(new Vector3(newRow, 0, newCol));
            //this._generator.assets["explosionSound"].setVolume(0.1);
            //this._generator.assets["explosionSound"].play();

            // remove
            setTimeout(() => {
                //particleSystem.dispose(true);
                instance.dispose();
            }, 1000);
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
