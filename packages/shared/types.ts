interface ITileItem {
    id: number;
    animated: boolean;
    sprite: string;
    frames: number;
    physics: boolean;
    explosivable: boolean;
    isPlayer: boolean;
    isEnemy: boolean;
}

interface ITileKeys {
    [key: string]: ITileItem;
}
