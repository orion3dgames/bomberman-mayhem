import tiles from "./Data/tiles.json";
import maps from "./Data/maps.json";
import { CellType, ITiles, Tile } from "./types";
import { Cell } from "../server/src/Rooms/Entities/Cell";

export class MapHelper {
    public mapData;
    public tiles: ITiles = {};

    // spawn points
    public spawnPoints: any = [];
    public baseCells: any = [];
    public cells: any = [];
    public shadow_map: any = [];

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
    public isTileAvailable(col, row): boolean {
        if (this.cells[col][row].isWalkable) {
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
    public isCellAvailable(cells, row, col) {
        for (let [key, element] of cells) {
            if (element.row === row && element.col === col && !element.cellInfo.isWalkable) {
                console.log("CANNOT MOVE TO: ", element.type, row, col);
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
                col: colId,
                row: rowId,
            });
        }

        // add to map cells
        if (!this.cells[colId]) {
            this.cells[colId] = [];
        }
        this.cells[colId][rowId] = foundTile;
    }

    //////////////////////////////////////////
    //////////////////////////////////////////
    //////// SERVER ONLY METHODS /////////////
    //////////////////////////////////////////
    //////////////////////////////////////////

    public updateCell(colId, rowId, type) {}

    public generateServerMap(room) {
        this.mapData.forEach((row, rowId) => {
            row.forEach((tileID, colId) => {
                // get tile details
                let foundTile = this.findTile(tileID) as Tile;

                // tile not found
                if (!foundTile) console.error("Tile: " + tileID + " does not exist, map data is corrupted");

                let sessionId = "" + rowId + "-" + colId;
                let type = CellType.GROUND;

                // if ground
                if (tileID === " " && Math.random() < 0.4) {
                    type = CellType.BREAKABLE_WALL;
                }

                // if wall
                if (tileID === "W") {
                    type = CellType.WALL;
                }

                let wall = new Cell(
                    {
                        sessionId: sessionId,
                        row: rowId,
                        col: colId,
                        type: type,
                    },
                    room
                );

                // add entity
                room.state.cells.set(sessionId, wall);

                // update shadowmap
                if (!this.shadow_map[rowId]) {
                    this.shadow_map[rowId] = [];
                }
                this.shadow_map[rowId][colId] = type;
            });
        });
    }

    public findAvailableColor(players, colors) {
        let randomColor = colors[Math.floor(Math.random() * colors.length)];
        let found = false;
        players.forEach((p) => {
            if (randomColor === p.color) {
                found = true;
            }
        });
        if (found) {
            return this.findAvailableColor(players, colors);
        }
        return randomColor;
    }
}
