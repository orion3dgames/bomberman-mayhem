import { Engine, Scene, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight } from "@babylonjs/core";
import { useStore } from "../store/index";
import { useRouter } from "vue-router";
import { Entity } from "./Entities/Entity";
import { LevelController } from "./LevelController";
import { PlayerInput } from "./Controllers/PlayerInput";
import { PlayerCamera } from "./Controllers/PlayerCamera";

import("@babylonjs/core/Debug/debugLayer");
import("@babylonjs/inspector");

const store = useStore();

export class GameController {
    public scene: Scene;
    public engine: Engine;
    public room;
    public players = new Map();
    public generator: LevelController;
    public camera: PlayerCamera;
    public sessionId: number;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas);
        this.scene = new Scene(this.engine);

        let light = new HemisphericLight("light", Vector3.Up(), this.scene);
        light.intensity = 0.8;

        // generate level
        this.generator = new LevelController(this.scene, "map_01");

        // start camera
        this.camera = new PlayerCamera(this);

        // setup colyseus events
        this.room = store.room;
        this.sessionId = this.room.sessionId;
        this.room.state.players.onAdd((entity, sessionId) => {
            let currentPlayer = sessionId === this.sessionId;
            let player = new Entity(sessionId, this.scene, this, currentPlayer);
            this.players.set(sessionId, player);
        });

        //
        window.addEventListener("keydown", (ev) => {
            //Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        });

        // engine loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // game loop
        let timeServer = Date.now();
        this.scene.registerBeforeRender(() => {
            let delta = this.engine.getFps();
            let timeNow = Date.now();

            this.players.forEach((player) => {
                player.update(delta);
            });

            let rate = 200;
            let timePassed = (timeNow - timeServer) / 1000;
            let updateRate = rate / 1000; // game is networked update every 100ms
            if (timePassed >= updateRate) {
                // player uppdate at server rate
                this.players.forEach((player) => {
                    player.updateServerRate(rate);
                });
                timeServer = timeNow;
            }
        });
    }
}
