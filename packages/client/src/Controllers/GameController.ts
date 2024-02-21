import { Network } from "./Network";
import { Config } from "../../../shared/Config";
import { SceneName, User } from "../../../shared/types";
import { generateUserName } from "../Utils/Utils";

export class GameController {
    // core
    public engine;
    public scene;
    public client: Network;
    public config: Config;

    // scene management
    public state: number = 0;
    public currentScene;
    public nextScene;

    // user
    public user: User;

    // network
    public joinedRoom;

    constructor(app) {
        // core
        this.engine = app.engine;
        this.config = app.config;
        this.scene = app.scene;

        // create use
        this.user = {
            displayName: generateUserName(),
        };

        // create colyseus client
        this.client = new Network(app.config.port);
    }

    /////////////////////////////////////////
    //////////// SCENE MANAGEMENT ///////////
    /////////////////////////////////////////

    public setScene(newState: SceneName) {
        this.nextScene = newState;
    }
}
