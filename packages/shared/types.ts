///////////////////////////////
///////////////////////////////
///////////////////////////////

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

///////////////////////////////
///////////////////////////////
///////////////////////////////

export enum SceneName {
    NULL = 0,
    HOME,
    ROOM,
    GAME,
}

///////////////////////////////
///////////////////////////////
///////////////////////////////

export type User = {
    displayName: string;
};

///////////////////////////////
///////////////////////////////
///////////////////////////////

export enum ServerMsg {
    PING = 1,
    PONG,
    START_GAME,
    START_GAME_REQUESTED,
    PLAYER_MOVE,
}

export type PlayerInputs = {
    seq: number;
    h: number;
    v: number;
};
