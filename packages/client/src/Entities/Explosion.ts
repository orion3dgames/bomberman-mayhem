import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { Animation } from "@babylonjs/core/Animations/animation";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CellType } from "../../../shared/types";

export class Explosion extends TransformNode {
    public _generator;
    public _map;
    public _room;

    public playerMesh;
    public mesh1;
    public mesh2;

    public type: CellType;
    public size: number = 1;
    public tile;
    public col: number = 0;
    public row: number = 0;

    constructor(name: string, scene: Scene, map, generator, room, data) {
        super(name, scene);

        // set variables
        this._room = room;
        this._scene = scene;
        this._map = map;
        this._generator = generator;

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

        // for every direction
        dirs.forEach((dir) => {
            // for distance
            for (let i = 0; i <= this.size; i++) {
                const col = this.col + dir.col * i;
                const row = this.row + dir.row * i;

                // get cell
                const cell = this._room.state.cells.get(row + "-" + col);

                console.log(dir.direction, cell.type, row, col);

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
                let instanceX = this._generator.assets["explosion"].clone("exp-" + row + "-" + col);
                instanceX.position = new Vector3(newCol, 0, newRow);
                instanceX.receiveShadows = true;
                instanceX.parent = this;
                instanceX.isVisible = true;
                instanceX.freezeWorldMatrix();

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
