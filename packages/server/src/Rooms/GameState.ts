import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Entities/Player";
import { Entity } from "./Entities/Entity";

export class GameState extends Schema {
    @type("string") status: "CREATED" | "PLAYING" | "ENDED" = "CREATED";
    @type({ map: Player }) players = new MapSchema<Player>();
    @type({ map: Entity }) entities = new MapSchema<Entity>();

    public cells: any[] = [];

    constructor(args) {
        super();
    }

    public update(dt) {
        // update players
        this.players.forEach((entity) => {
            entity.update(dt);
        });

        // update entities
        this.entities.forEach((entity) => {
            entity.update(dt);
        });
    }
}
