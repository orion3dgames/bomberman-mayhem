import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Button } from "@babylonjs/gui/2D/controls/button";

import { GameController } from "../Controllers/GameController";
import { SceneName, ServerMsg } from "../../../shared/types";
import { ScrollViewer } from "@babylonjs/gui/2D/controls/scrollViewers/scrollViewer";
import { Grid } from "@babylonjs/gui/2D/controls/grid";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { Room } from "colyseus.js";
import { MenuOptions } from "../Utils/MenuOptions";

export class RoomScene {
    private _game: GameController;
    public _scene: Scene;
    public _newState: SceneName;
    public _button: Button;
    public _ui;
    public _shadow;

    public room: Room;
    public sessionId;
    public players = new Map();

    // ui
    public playerStackPanel: StackPanel;

    // calllbacks
    public callbacksToRemove: any[] = [];

    constructor() {
        this._newState = SceneName.NULL;
    }

    async createScene(game): Promise<void> {
        // app
        this._game = game;

        // room
        this.room = this._game.joinedRoom as Room;

        // create scene
        let scene = new Scene(this._game.engine);

        // set scene
        this._scene = scene;

        // set sky color
        this._scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

        //creates and positions a free camera
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._scene);
        camera.setTarget(Vector3.Zero()); //targets the camera to scene origin

        // create ui
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.create(guiMenu);

        // setup colyseus room
        if (this.room) {
            window.location.hash = this.room.roomId;
            this.sessionId = this.room.sessionId;
            let evtOnAdd = this.room.state.players.onAdd((entity, sessionId) => {
                console.log("[ROOM] PLAYER ADDED", entity);
                this.players.set(sessionId, entity);
                this.refreshUI();
            });
            let evtOnRemove = this.room.state.players.onRemove((entity, sessionId) => {
                console.log("[ROOM] PLAYER LEFT", sessionId);
                this.players.delete(sessionId);
                this.refreshUI();
            });
            this.callbacksToRemove.push(evtOnAdd);
            this.callbacksToRemove.push(evtOnRemove);

            // start game event
            this.room.onMessage(ServerMsg.START_GAME, (message) => {
                console.log("message received from server", message);

                // remove any messages events
                this.room.removeAllListeners();

                // remove onAdd and onRemove callbacks
                this.callbacksToRemove.forEach((callback) => callback());

                // go to game scene
                this._game.setScene(SceneName.GAME);
            });
        }
    }

    refreshUI() {
        console.log("[ROOM] REFRESH UI", this.playerStackPanel.children.length);

        // if already exists
        this.playerStackPanel.getDescendants().forEach((el) => {
            el.dispose();
        });

        // middle columm
        const blocGame = new Rectangle("totalPlayers");
        blocGame.width = 1;
        blocGame.height = "24px;";
        blocGame.background = "white";
        blocGame.thickness = 0;
        blocGame.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.playerStackPanel.addControl(blocGame);

        const textGame = new TextBlock("totalPlayers");
        textGame.width = 1;
        textGame.text = "Players " + this.players.size + " / 4";
        textGame.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        textGame.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        blocGame.addControl(textGame);

        this.players.forEach((player) => {
            // rect
            const blocGame = new Rectangle("blocGame" + player.sessionId);
            blocGame.width = 1;
            blocGame.height = "50px;";
            blocGame.background = "gray";
            blocGame.thickness = 0;
            blocGame.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.playerStackPanel.addControl(blocGame);

            // middle columm
            const textGame = new TextBlock("textGame" + player.sessionId);
            textGame.width = 1;
            textGame.text = player.name;
            textGame.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            blocGame.addControl(textGame);
        });

        // showing available players slot
        for (let i = 0; i < 4 - this.players.size; i++) {
            // rect
            const blocGame = new Rectangle("blocGame" + i);
            blocGame.width = 1;
            blocGame.height = "50px;";
            blocGame.background = "lightgray";
            blocGame.thickness = 0;
            blocGame.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.playerStackPanel.addControl(blocGame);

            // middle columm
            const textGame = new TextBlock("textGame" + i);
            textGame.width = 1;
            textGame.text = "WAITING FOR PLAYER...";
            textGame.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            blocGame.addControl(textGame);
        }
    }

    create(guiMenu) {
        let padding = 15;

        // full width
        const fullWidth = new Rectangle("fullwidth");
        fullWidth.width = 1;
        fullWidth.height = 1;
        fullWidth.thickness = 0;
        fullWidth.background = "#222222";
        fullWidth.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        guiMenu.addControl(fullWidth);

        // middle columm
        const columnRect = new Rectangle("column");
        columnRect.width = "400px";
        columnRect.height = 1;
        columnRect.background = "transparent";
        columnRect.thickness = 0;
        columnRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        fullWidth.addControl(columnRect);

        const subGrid = new Grid();
        subGrid.addRowDefinition(padding, true);
        subGrid.addColumnDefinition(1);
        subGrid.addRowDefinition(30, true); // HEADER CANCEL BUTTON
        subGrid.addRowDefinition(padding, true);
        subGrid.addRowDefinition(30, true); // HEADER TITLE
        subGrid.addRowDefinition(padding, true);
        subGrid.addRowDefinition(1); // MAIN CONTENT
        subGrid.addRowDefinition(padding, true);
        subGrid.addRowDefinition(60, true); // CREATE BUTTON
        subGrid.addRowDefinition(padding, true);
        columnRect.addControl(subGrid);

        const cancelButton = Button.CreateSimpleButton("cancelButton", "CANCEL");
        cancelButton.width = 1;
        cancelButton.height = "30px";
        cancelButton.color = "white";
        cancelButton.thickness = 1;
        cancelButton.color = "#FFF";
        cancelButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        cancelButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        subGrid.addControl(cancelButton, 1);

        cancelButton.onPointerUpObservable.add(() => {
            this.room.leave();
            this._game.setScene(SceneName.HOME);
        });

        //
        const subHeaderGrid = new Rectangle();
        subHeaderGrid.background = "white";
        subHeaderGrid.thickness = 0;
        subGrid.addControl(subHeaderGrid, 3);

        const titleGame = new TextBlock("titleGame" + this.room.roomId);
        titleGame.width = 1;
        titleGame.text = "ROOM #" + this.room.roomId;
        titleGame.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        subHeaderGrid.addControl(titleGame);

        //
        const subMainGrid = new Rectangle();
        subMainGrid.background = "white";
        subMainGrid.thickness = 0;
        subGrid.addControl(subMainGrid, 5);

        // add scrollable container
        const chatScrollViewer = new ScrollViewer("chatScrollViewer");
        chatScrollViewer.width = 1;
        chatScrollViewer.height = 1;
        chatScrollViewer.top = "0px";
        chatScrollViewer.thickness = 0;
        chatScrollViewer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        chatScrollViewer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        subMainGrid.addControl(chatScrollViewer);

        // add stack panel
        const playerStackPanel = new StackPanel("playerStackPanel");
        playerStackPanel.width = "100%";
        playerStackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        playerStackPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        playerStackPanel.paddingTop = "5px;";
        playerStackPanel.spacing = 5;
        playerStackPanel.setPadding(padding, padding, padding, padding);
        chatScrollViewer.addControl(playerStackPanel);
        this.playerStackPanel = playerStackPanel;

        const createBtn = Button.CreateSimpleButton("back", "START");
        createBtn.width = 1;
        createBtn.height = "60px";
        createBtn.color = "white";
        createBtn.thickness = 1;
        createBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        createBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        subGrid.addControl(createBtn, 7);

        ///////
        createBtn.onPointerUpObservable.add(() => {
            this.room.send(ServerMsg.START_GAME_REQUESTED);
        });

        // load scene
        this._ui = guiMenu;
    }

    test() {
        //////////// add map options
        /*
        var dropdownA = new MenuOptions(subHeaderGrid, { width: 180, height: 40 });
        dropdownA.button.children[0].text = "Ajouter";
        dropdownA.top = "10px";
        dropdownA.left = "10px";
        dropdownA.addOption("Option A", function () {
            alert("Option A");
        });
        dropdownA.addOption("Option B", function () {
            alert("Option B");
        });
        dropdownA.addOption("Option C", function () {
            alert("Option C");
        });
        dropdownA.addOption("Option D", function () {
            alert("Option D");
        });*/
    }
}
