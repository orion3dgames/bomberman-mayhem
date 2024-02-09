import { Engine, Scene, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight } from "@babylonjs/core";
import { useStore } from "../store/index";
import { useRouter } from "vue-router";
import { Entity } from "./Entities/Entity";

const store = useStore();

export class GameController {
    private scene: Scene;
    private engine: Engine;
    private room;

    public players = new Map();

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas);
        this.scene = new Scene(this.engine);

        const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), this.scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);

        new HemisphericLight("light", Vector3.Up(), this.scene);

        this.room = store.room;
        this.sessionId = this.room.sessionId;

        this.room.state.players.onAdd((entity, sessionId) => {
            let player = new Entity(this.scene);
            this.players.set(sessionId, player);
        });

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        this.scene.registerBeforeRender(() => {
            let delta = this.engine.getFps();
        });
    }
}
