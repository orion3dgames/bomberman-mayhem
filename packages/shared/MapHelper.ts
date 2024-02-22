import { map_01, map_02 } from "./Maps";
import { tiles, Tile } from "./Maps/tiles";

export class MapHelper {
    //
    public mapData;
    public tiles: Tile[] = [];

    // spawn points
    public spawnPoints: any = [];
    public walkableTiles: any = [];

    constructor(mapName: string = "map_01") {
        // get map data
        this.mapData = this.getMapData(mapName);

        // get all map tiles
        this.tiles = tiles;

        // generate level
        this.generate(mapName);
    }

    public setSpawnPoint(sessionId) {
        for (var i = 0; i < this.spawnPoints.length; i++) {
            let spawn = this.spawnPoints[i];
            if (!spawn.player) {
                this.spawnPoints[i].player = sessionId;
                return spawn;
            }
        }
    }

    public isTileAvailable(row, col) {
        return this.walkableTiles[row][col];
    }

    /////////////////

    private async generate(map: string) {
        this.mapData.forEach((row, rowId) => {
            row.forEach((col, colId) => {
                col.forEach((subcol, subcolId) => {
                    this.processTile(subcol, rowId, colId);
                });
            });
        });
    }

    private processTile(subcol, rowId, colId) {
        // find tile
        let foundTile = this.tiles[subcol] as Tile;

        // tile not found
        if (!foundTile) console.error("Tile: " + subcol + " does not exist, map data is corrupted");

        // spawnpoint tiles
        if (foundTile.id == 1) {
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
            if (!this.walkableTiles[rowId]) {
                this.walkableTiles[rowId] = [];
            }
            this.walkableTiles[rowId][colId] = foundTile.id;
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
