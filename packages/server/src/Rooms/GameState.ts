import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Entities/Player";
import { Entity } from "./Entities/Entity";
import { Cell } from "./Entities/Cell";
import { Bomb } from "./Entities/Bomb";
import { PowerUp } from "./Entities/PowerUp";

export class GameState extends Schema {
    @type("string") status: "CREATED" | "PLAYING" | "ENDED" = "CREATED";
    @type("string") map: string = "map_01";
    @type({ map: Player }) players = new MapSchema<Player>();
    @type({ map: Cell }) cells = new MapSchema<Cell>();
    @type({ map: Bomb }) bombs = new MapSchema<Bomb>();
    @type({ map: PowerUp }) powers = new MapSchema<PowerUp>();

    constructor(args) {
        super();
    }

    public update(dt) {
        // update players
        this.players.forEach((entity) => {
            entity.update(dt);
        });

        // update entities
        this.cells.forEach((entity) => {});
    }
}
