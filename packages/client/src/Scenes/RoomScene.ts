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
import { title } from "process";

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
    public mapStackPanel: StackPanel;

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

        // hide loading screen
        this._game.engine.hideLoadingUI();

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
                this.updatePlayers();
            });
            let evtOnRemove = this.room.state.players.onRemove((entity, sessionId) => {
                console.log("[ROOM] PLAYER LEFT", sessionId);
                this.players.delete(sessionId);
                this.updatePlayers();
            });
            this.callbacksToRemove.push(evtOnAdd);
            this.callbacksToRemove.push(evtOnRemove);

            // monitor map changes
            this.room.state.listen("map", (currentValue, previousValue) => {
                this.changeMap(currentValue);
            });

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

    changeMap(key) {
        console.log("changeMap", key);
        this._game.selectedMap = this._game.maps[key];
        this.updateMaps();
    }

    updatePlayers() {
        console.log("[ROOM] REFRESH PLAYER PANEL", this.playerStackPanel.children.length);

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

    updateMaps() {
        console.log("[ROOM] REFRESH MAP PANEL");

        // if already exists
        this.mapStackPanel.getDescendants().forEach((el) => {
            el.dispose();
        });

        // add title
        const textGame = new TextBlock("mapTitle");
        textGame.width = 1;
        textGame.height = "20px";
        textGame.text = "Choose Map";
        textGame.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        textGame.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        textGame.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        textGame.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.mapStackPanel.addControl(textGame);

        // add maps
        for (let makKey in this._game.maps) {
            let map = this._game.maps[makKey];

            const mapBtn = Button.CreateSimpleButton("mapBtn" + makKey, map.name);
            mapBtn.width = "100px";
            mapBtn.height = "60px";
            mapBtn.color = "black";
            mapBtn.background = "white";
            mapBtn.thickness = 1;
            mapBtn.fontSizeInPixels = 18;
            mapBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            mapBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

            if (this._game.selectedMap && this._game.selectedMap.key == map.key) {
                mapBtn.color = "white";
                mapBtn.background = this._game.config.primary_color;
            }

            this.mapStackPanel.addControl(mapBtn);

            mapBtn.onPointerUpObservable.add(() => {
                this._game.selectedMap = map;
                this.room.send(ServerMsg.START_MAP_UPDATE, { key: map.key });
                this.updateMaps();
            });
        }
    }

    create(guiMenu) {
        let padding = 10;

        // full width
        const fullWidth = new Rectangle("fullwidth");
        fullWidth.width = 1;
        fullWidth.height = 1;
        fullWidth.thickness = 0;
        fullWidth.background = "#222222";
        fullWidth.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        fullWidth.fontFamily = this._game.config.fontFamily;
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

        subGrid.addColumnDefinition(1);

        subGrid.addRowDefinition(padding, true);

        subGrid.addRowDefinition(50, true); // HEADER CANCEL BUTTON
        subGrid.addRowDefinition(padding, true);

        subGrid.addRowDefinition(50, true); // HEADER TITLE
        subGrid.addRowDefinition(padding, true);

        subGrid.addRowDefinition(120, true); // MAPS SECTION
        subGrid.addRowDefinition(padding, true);

        subGrid.addRowDefinition(1); // MAIN CONTENT TAKES REMAINING AVAILABLE SPACE
        subGrid.addRowDefinition(padding, true);

        subGrid.addRowDefinition(50, true); // CREATE BUTTON
        subGrid.addRowDefinition(padding, true);

        columnRect.addControl(subGrid);

        // 1
        const cancelButton = Button.CreateSimpleButton("cancelButton", "CANCEL");
        cancelButton.width = 1;
        cancelButton.height = "50px";
        cancelButton.color = "white";
        cancelButton.fontSizeInPixels = 22;
        cancelButton.thickness = 1;
        cancelButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        cancelButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        subGrid.addControl(cancelButton, 1);

        cancelButton.onPointerUpObservable.add(() => {
            this.room.leave();
            this._game.setScene(SceneName.HOME);
        });

        // 2 padding

        // 3
        const subHeaderGrid = new Rectangle();
        subHeaderGrid.background = "white";
        subHeaderGrid.thickness = 0;
        subGrid.addControl(subHeaderGrid, 3);

        const titleGame = new TextBlock("titleGame" + this.room.roomId);
        titleGame.width = 1;
        titleGame.text = "ROOM #" + this.room.roomId;
        titleGame.fontSizeInPixels = 26;
        titleGame.color = this._game.config.primary_color;
        titleGame.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        subHeaderGrid.addControl(titleGame);

        // 4 padding

        ///////////// MAPS
        // 5
        const mapBloc = new Rectangle();
        mapBloc.background = "white";
        mapBloc.thickness = 0;
        subGrid.addControl(mapBloc, 5);

        // add scrollable container
        const mapScrollViewer = new ScrollViewer("mapScrollViewer");
        mapScrollViewer.width = 1;
        mapScrollViewer.height = 1;
        mapScrollViewer.thickness = 0;
        mapScrollViewer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        mapScrollViewer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        mapBloc.addControl(mapScrollViewer);

        // add stack panel
        const mapStackPanel = new StackPanel("mapStackPanel");
        mapStackPanel.width = "100%";
        mapStackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        mapStackPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        mapStackPanel.spacing = 5;
        mapStackPanel.isVertical = false;
        mapStackPanel.setPadding(padding, padding, padding, padding);
        mapScrollViewer.addControl(mapStackPanel);
        this.mapStackPanel = mapStackPanel;

        this.updateMaps();

        // 6 padding

        ///////////// PLAYERS
        // 7
        const subMainGrid = new Rectangle();
        subMainGrid.background = "white";
        subMainGrid.thickness = 0;
        subGrid.addControl(subMainGrid, 7);

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

        // 8

        // 9
        const createBtn = Button.CreateSimpleButton("back", "START");
        createBtn.width = 1;
        createBtn.thickness = 0;
        createBtn.heightInPixels = this._game.config.button.height;
        createBtn.color = this._game.config.button.color;
        createBtn.background = this._game.config.button.background;
        createBtn.textBlock.fontSizeInPixels = this._game.config.button.fontSize;
        createBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        createBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        subGrid.addControl(createBtn, 9);

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
