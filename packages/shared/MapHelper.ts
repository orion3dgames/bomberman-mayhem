import tiles from "./Data/tiles.json";
import maps from "./Data/maps.json";
import { ITiles, Tile } from "./types";
import { Wall } from "../server/src/Rooms/Entities/Wall";

export class MapHelper {
    public mapData;
    public tiles: ITiles = {};

    // spawn points
    public spawnPoints: any = [];
    public baseCells: any = [];
    public cells: any = [];

    constructor(mapName: string = "map_01") {
        // get map data
        this.mapData = maps[mapName].data;

        // get all map tiles
        this.tiles = tiles;

        // generate level
        this.generate(mapName);
    }

    /**
     * Find a free spawn point for player
     * @param sessionId
     * @returns
     */
    public setSpawnPoint(sessionId) {
        for (var i = 0; i < this.spawnPoints.length; i++) {
            let spawn = this.spawnPoints[i];
            if (!spawn.player) {
                this.spawnPoints[i].player = sessionId;
                return spawn;
            }
        }
    }

    /**
     * Check if tile (row, col) is free
     * @param row
     * @param col
     * @returns boolean
     */
    public isTileAvailable(row, col): boolean {
        if (this.cells[row][col].isWalkable) {
            return true;
        }
        return false;
    }

    /**
     * check if cell is available.
     * @param entities
     * @param x
     * @param z
     * @returns
     */
    public isCellAvailable(entities, x, z) {
        for (let [key, element] of entities) {
            if (element.x === x && element.z === z) {
                console.log("CANNOT MOVE TO: ", x, z);
                return false;
            }
        }
        return true;
    }

    public async generate(map: string) {
        this.mapData.forEach((col, colId) => {
            col.forEach((tileID, rowId) => {
                this.processTile(tileID, colId, rowId);
            });
        });
        this.baseCells = [...this.cells];
    }

    public findTile(tileID, id = "id") {
        let found;
        for (let tID in tiles) {
            let tile = tiles[tID];
            if (tile && tile[id] === tileID) {
                found = tile;
            }
        }
        return found;
    }

    private processTile(tileID, colId, rowId) {
        // get tile details
        let foundTile = this.findTile(tileID) as Tile;

        // tile not found
        if (!foundTile) console.error("Tile: " + tileID + " does not exist, map data is corrupted");

        // spawnpoint tiles
        if (foundTile.id == "S") {
            this.spawnPoints.push({
                player: false,
                position: {
                    x: rowId,
                    y: 0,
                    z: colId,
                },
            });
        }

        // add to map cells
        if (!this.cells[rowId]) {
            this.cells[rowId] = [];
        }
        this.cells[rowId][colId] = foundTile;
    }

    //////////////////////////////////////////
    //////////////////////////////////////////
    //////// SERVER ONLY METHODS /////////////
    //////////////////////////////////////////
    //////////////////////////////////////////

    public updateCell(colId, rowId, type) {}

    public generateBreakableCells(room) {
        // create breakable walls
        this.cells.forEach((cols, colId) => {
            cols.forEach((row, rowId) => {
                // 50% chance empty ground will be a soft wall
                if (row.id === " " && Math.random() < 0.5) {
                    // add wall
                    let wall = new Wall(
                        {
                            sessionId: "wall-" + colId + "-" + rowId,
                            x: colId,
                            y: 0,
                            z: rowId,
                        },
                        room
                    );
                    room.state.entities.set(wall.sessionId, wall);

                    // update cells
                    this.cells[colId][rowId] = tiles.breakable_wall;
                }
            });
        });
    }
}
