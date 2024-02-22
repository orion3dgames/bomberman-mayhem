import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { InputText } from "@babylonjs/gui/2D/controls/inputText";
import { Image } from "@babylonjs/gui/2D/controls/image";

import { GameController } from "../Controllers/GameController";
import { SceneName } from "../../../shared/types";
import { ScrollViewer } from "@babylonjs/gui/2D/controls/scrollViewers/scrollViewer";
import { Grid } from "@babylonjs/gui/2D/controls/grid";
import { RoomAvailable } from "colyseus.js/lib/Room";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";

export class HomeScene {
    private _game: GameController;
    public _scene: Scene;
    public _newState: SceneName;
    public _ui;

    // ui
    public lobbyScroller: ScrollViewer;
    public lobbyStackPanel: StackPanel;

    // lobby
    public lobbyJoined;
    public allRooms: RoomAvailable[] = [];

    constructor() {
        this._newState = SceneName.NULL;
    }

    async createScene(game): Promise<void> {
        // app
        this._game = game;

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

        // setup colyseus lobby
        this.events();
    }

    async events() {
        this._game.client.joinLobby().then((lobbyJoined) => {
            console.log(lobbyJoined.sessionId, "joined", lobbyJoined.name);

            this.lobbyJoined = lobbyJoined;

            this.lobbyJoined.onMessage("rooms", (rooms: []) => {
                console.log("ALL ROOMS", rooms);
                this.allRooms = rooms;
                this.loadRooms();
            });

            this.lobbyJoined.onMessage("+", ([roomId, room]) => {
                const roomIndex = this.allRooms.findIndex((room) => room.roomId === roomId);
                if (roomIndex !== -1) {
                    this.allRooms[roomIndex] = room;
                    console.log("UPDATE ROOM", room.roomId, room.status);
                } else {
                    this.allRooms.push(room);
                    console.log("NEW ROOM", room.roomId);
                }
                this.loadRooms();
            });

            this.lobbyJoined.onMessage("-", (roomId) => {
                console.log("REMOVE ROOMS", roomId);
                this.allRooms = this.allRooms.filter((room) => room.roomId !== roomId);
                this.loadRooms();
            });
        });
    }

    loadRooms() {
        console.log("[LOBBY] REFRESH UI", this.lobbyStackPanel.children.length);

        // if already exists
        this.lobbyStackPanel.getDescendants().forEach((el) => {
            el.dispose();
        });

        if (this.allRooms.length > 0) {
            this.allRooms.forEach((room) => {
                const blocGame = Button.CreateSimpleButton("blocGame" + room.roomId, room.roomId + ": " + room.clients + "/" + room.maxClients);
                blocGame.width = 1;
                blocGame.height = "60px";
                blocGame.color = "white";
                blocGame.thickness = 1;
                blocGame.color = "#000";
                blocGame.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                blocGame.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                this.lobbyStackPanel.addControl(blocGame);

                blocGame.onPointerUpObservable.add(async () => {
                    this._game.client.join(room.roomId, this._game.user.displayName).then((joinedRoom) => {
                        this._game.joinedRoom = joinedRoom;
                        this._game.setScene(SceneName.ROOM);
                        this.lobbyJoined.leave();
                    });
                });
            });
        } else {
            // no rooms text
            const welcomeText = new TextBlock("infotext", "No rooms available...");
            welcomeText.width = 0.8;
            welcomeText.height = "30px";
            welcomeText.top = "30px";
            welcomeText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            welcomeText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            this.lobbyStackPanel.addControl(welcomeText);
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

        const grid = new Grid();
        grid.addColumnDefinition(1);
        grid.addRowDefinition(120, true);
        grid.addRowDefinition(80, true);
        grid.addRowDefinition(padding, true);
        grid.addRowDefinition(0.7);
        grid.addRowDefinition(padding, true);
        columnRect.addControl(grid);

        // This rect will be on first row and second column
        const header = new Rectangle();
        header.background = "transparent";
        header.thickness = 0;
        grid.addControl(header, 0);

        // This rect will be on second row and third column
        const formBloc = new Rectangle();
        formBloc.background = "white";
        formBloc.thickness = 0;
        grid.addControl(formBloc, 1);

        const mainBloc = new Rectangle();
        mainBloc.background = "white";
        mainBloc.thickness = 0;
        grid.addControl(mainBloc, 3);

        ///////////////////////////////////////////////////////
        // header

        // logo
        var imgLogo = new Image("imgLogo", "./images/logo2.png");
        imgLogo.stretch = Image.STRETCH_UNIFORM;
        imgLogo.top = "10px";
        imgLogo.width = 1;
        imgLogo.height = "60px;";
        imgLogo.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        header.addControl(imgLogo);

        // welcome text
        const welcomeText = new TextBlock("infotext", this._game.config.version);
        welcomeText.width = 0.8;
        welcomeText.height = "30px";
        welcomeText.color = "white";
        welcomeText.top = "75px";
        welcomeText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        welcomeText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        header.addControl(welcomeText);

        //////////////////////////////////////////////////
        // FORM CONTAINER columm
        const formName = new Rectangle("formName");
        formName.background = "white";
        formName.width = 1;
        formName.height = "80px";
        formName.top = "0px";
        formName.thickness = 0;
        formName.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        formName.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        formBloc.addControl(formName);

        // username input
        const usernameInput = new InputText("usernameInput");
        usernameInput.top = "-" + padding + "px";
        usernameInput.width = 1;
        usernameInput.height = "40px;";
        usernameInput.color = "#000";
        usernameInput.background = "#FFF";
        usernameInput.text = this._game.user.displayName;
        usernameInput.focusedBackground = "gray";
        usernameInput.placeholderText = "Enter Username";
        usernameInput.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        usernameInput.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        usernameInput.setPadding(padding, padding, -padding, padding);
        formBloc.addControl(usernameInput);

        //////////////////////////////////////////////////
        // FORM CONTAINER columm

        const subGrid = new Grid();
        subGrid.addColumnDefinition(1);
        subGrid.addRowDefinition(30, true);
        subGrid.addRowDefinition(padding, true);
        subGrid.addRowDefinition(1);
        subGrid.setPadding(padding, padding, padding, padding);
        mainBloc.addControl(subGrid);

        const subHeaderGrid = new Rectangle();
        subHeaderGrid.background = "white";
        subHeaderGrid.thickness = 0;
        subGrid.addControl(subHeaderGrid, 0);

        const subMainGrid = new Rectangle();
        subMainGrid.background = "white";
        subMainGrid.thickness = 0;
        subGrid.addControl(subMainGrid, 2);

        const createBtn = Button.CreateSimpleButton("createBtn", "CREATE");
        createBtn.width = 1;
        createBtn.height = "30px";
        createBtn.color = "white";
        createBtn.thickness = 1;
        createBtn.color = "#000";
        createBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        createBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        subHeaderGrid.addControl(createBtn);

        createBtn.onPointerUpObservable.add(async () => {
            this._game.client.create(this._game.user.displayName).then((joinedRoom) => {
                this._game.joinedRoom = joinedRoom;
                this._game.setScene(SceneName.ROOM);
                this.lobbyJoined.leave();
            });
        });

        // add scrollable container
        const lobbyScroller = new ScrollViewer("chatScrollViewer");
        lobbyScroller.width = 1;
        lobbyScroller.height = 1;
        lobbyScroller.top = "0px";
        lobbyScroller.thickness = 1;
        lobbyScroller.background = "#EEEEEE";
        lobbyScroller.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        lobbyScroller.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        subMainGrid.addControl(lobbyScroller);

        // add stack panel
        const lobbyStackPanel = new StackPanel("lobbyStackPanel");
        lobbyStackPanel.width = "100%";
        lobbyStackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        lobbyStackPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        lobbyStackPanel.paddingTop = "5px;";
        lobbyStackPanel.spacing = 5;
        lobbyScroller.addControl(lobbyStackPanel);

        // load scene
        this.lobbyScroller = lobbyScroller;
        this.lobbyStackPanel = lobbyStackPanel;
        this._ui = guiMenu;
    }
}
