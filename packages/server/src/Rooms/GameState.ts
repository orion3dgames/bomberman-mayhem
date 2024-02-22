import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Entities/Player";

export class GameState extends Schema {
    @type("string") status: "CREATED" | "PLAYING" | "ENDED" = "CREATED";
    @type("string") map: "map_01";
    @type({ map: Player }) players = new MapSchema<Player>();

    constructor(args) {
        super();
    }

    public update(dt) {}
}
