/**
 * https://stmn.github.io/ascii-map-editor/#
 * Use the id's below to generate the map
 */

import { ITiles } from "../types";

const tiles: ITiles = {
    " ": {
        id: " ",
        name: "ground",
        width: 1,
        height: 0.1,
        isWalkable: true,
        offset_y: -0.1,
    },
    S: {
        id: "S",
        name: "spawnpoint",
        width: 1,
        height: 1,
        isWalkable: true,
        offset_y: -0.1,
    },
    B: {
        id: "B",
        name: "breakable_wall",
        width: 1,
        height: 1,
    },
    W: {
        id: "W",
        name: "wall",
        width: 1,
        height: 1,
        offset_y: 0,
    },
};

export { tiles };
