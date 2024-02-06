import { Schema, MapSchema, type, ArraySchema, filter } from "@colyseus/schema";
import gameConfig from "../game.config";

export class Player extends Schema {
    @type("string") sessionId: string;
    @type("string") displayName: string;
    @type("boolean") ready = false;
    @type("boolean") autoReady = false;
    @type("boolean") disconnected = false;
    @type("boolean") admin: boolean;
}

export class GameState extends Schema {
    @type("string") roundState: "idle" | "dealing" | "turns" | "end" = "idle";
    @type({ map: Player }) players = new MapSchema<Player>();
}
