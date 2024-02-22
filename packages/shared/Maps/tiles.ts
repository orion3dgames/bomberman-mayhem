type Tile = {
    id: number;
    name: string;
    width: number;
    height: number;
    isWalkable?: boolean;
};

const tiles: Tile[] = [
    {
        id: 0,
        name: "ground",
        width: 1,
        height: 0.1,
        isWalkable: true,
    },
    {
        id: 1,
        name: "spawn",
        width: 1,
        height: 1,
        isWalkable: true,
    },
    {
        id: 2,
        name: "wall",
        width: 1,
        height: 1,
    },
    {
        id: 3,
        name: "bomb",
        width: 1,
        height: 1,
    },
];

export { tiles, Tile };
