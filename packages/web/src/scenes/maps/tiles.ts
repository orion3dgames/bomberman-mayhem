import { Color3 } from "@babylonjs/core/Maths/math.color";

type Tile = {
    id: number;
    name: string;
    width: number;
    height: number;
    color: Color3;
    isWalkable?: boolean;
};

const tiles: Tile[] = [
    {
        id: 0,
        name: "ground",
        width: 1,
        height: 0.1,
        color: Color3.White(),
        isWalkable: true,
    },
    {
        id: 1,
        name: "spawn",
        width: 1,
        height: 1,
        color: Color3.Red(),
        isWalkable: true,
    },
    {
        id: 2,
        name: "wall",
        width: 1,
        height: 1,
        color: Color3.Blue(),
    },
    {
        id: 3,
        name: "bomb",
        width: 1,
        height: 1,
        color: Color3.Black(),
    },
];

export { tiles, Tile };
