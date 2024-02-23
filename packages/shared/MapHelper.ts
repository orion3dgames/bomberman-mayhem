import { map_01, map_02 } from "./Maps";
import { tiles } from "./Maps/tiles";
import { ITiles, Tile } from "./types";

export class MapHelper {
    //
    public mapData;
    public tiles: ITiles = {};

    // spawn points
    public spawnPoints: any = [];
    public unwalkableTiles: any = [];

    constructor(mapName: string = "map_01") {
        // get map data
        this.mapData = this.getMapData(mapName);

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
        if (!this.unwalkableTiles[row][col]) {
            return true;
        }
        return false;
    }

    public async generate(map: string) {
        this.mapData.forEach((col, colId) => {
            col.forEach((tileID, rowId) => {
                this.processTile(tileID, colId, rowId);
            });
        });
    }

    private processTile(tileID, colId, rowId) {
        // get tile details
        let foundTile = this.tiles[tileID] as Tile;

        // tile not found
        if (!foundTile) console.error("Tile: " + tileID + " does not exist, map data is corrupted");

        // spawnpoint tiles
        if (foundTile.id == "S") {
            console.log(foundTile);
            this.spawnPoints.push({
                player: false,
                position: {
                    x: rowId,
                    y: 0,
                    z: colId,
                },
            });
        }

        // is walkable tiles
        if (!foundTile.isWalkable) {
            if (!this.unwalkableTiles[rowId]) {
                this.unwalkableTiles[rowId] = [];
            }
            this.unwalkableTiles[rowId][colId] = foundTile.id;
        }
    }

    private getMapData(mapName: string) {
        switch (mapName) {
            case "map_01":
                return map_01;
                break;
            case "map_02":
                return map_02;
                break;
        }
    }
}
