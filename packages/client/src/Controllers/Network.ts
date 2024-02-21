// colyseus
import { Client, Room } from "colyseus.js";
import { isLocal } from "../Utils/Utils";

export class Network {
    public _client: Client;

    constructor(port) {
        // create colyseus client
        let url = "wss://" + window.location.hostname;
        if (isLocal()) {
            url = "ws://localhost:" + port;
        }
        let options = {
            hostname: url,
            secure: false,
            port: port,
        };
        this._client = new Client(url);
    }

    public async joinLobby(): Promise<any> {
        return new Promise(async (resolve: any, reject: any) => {
            return await this._client
                .joinOrCreate("lobby")
                .then((lobbyJoined) => {
                    resolve(lobbyJoined);
                })
                .catch((e: any) => {
                    console.error("JOIN ERROR", e);
                    reject(e);
                });
        });
    }

    public async create(displayName: string = "test"): Promise<any> {
        return new Promise(async (resolve: any, reject: any) => {
            let options = {
                name: displayName,
            };
            this._client
                .create("gameroom", options)
                .then((joinedRoom: Room) => {
                    resolve(joinedRoom);
                })
                .catch((e: any) => {
                    console.error("JOIN ERROR", e);
                    reject(e);
                });
        });
    }

    public async join(roomId, displayName: string = "test"): Promise<any> {
        return new Promise(async (resolve: any, reject: any) => {
            let options = {
                name: displayName,
            };
            this._client
                .joinById(roomId, options)
                .then((joinedRoom: Room) => {
                    resolve(joinedRoom);
                })
                .catch((e: any) => {
                    console.error("JOIN ERROR", e);
                    reject(e);
                });
        });
    }

    public async createOrJoin(roomId, user): Promise<any> {
        return new Promise(async (resolve: any, reject: any) => {
            this._client.getAvailableRooms("gameroom").then((rooms) => {
                let foundRoom;
                rooms.forEach((room) => {
                    if (room.roomId === roomId) {
                        foundRoom = room;
                    }
                });
                if (foundRoom) {
                    this._client
                        .joinById(foundRoom.roomId, user)
                        .then((joinedRoom: Room) => {
                            console.info("JOIN SUCCESS", joinedRoom);
                            resolve(joinedRoom);
                        })
                        .catch((e: any) => {
                            console.error("JOIN ERROR", e);
                        });
                } else {
                    this._client
                        .create("gameroom", {
                            roomId: roomId,
                            name: user.displayName,
                        })
                        .then((joinedRoom: Room) => {
                            console.info("CREATE SUCCESS", joinedRoom);
                            resolve(joinedRoom);
                        })
                        .catch((e: any) => {
                            console.error("CREATE ERROR", e);
                        });
                }
            });
        });
    }

    /*
    public async joinRoom(roomId, token, character_id): Promise<any> {
        return await this._client.joinById(roomId, {
            token: token,
            character_id: character_id,
        });
    }

    public async joinChatRoom(data): Promise<any> {
        return await this._client.joinOrCreate("chat_room", data);
    }

    public async findCurrentRoom(currentRoomKey): Promise<any> {
        return new Promise(async (resolve: any, reject: any) => {
            let rooms = await this._client.getAvailableRooms("game_room");
            if (rooms.length > 0) {
                rooms.forEach((room) => {
                    if (room.metadata.location === currentRoomKey) {
                        resolve(room);
                    }
                });
            }
            resolve(false);
        });
    }

    public async joinOrCreateRoom(location, token, character_id): Promise<any> {
        // find all exisiting rooms
        let rooms = await this._client.getAvailableRooms("game_room");

        // rooms exists
        if (rooms.length > 0) {
            // do we already have a room for the specified location
            let roomIdFound: boolean | string = false;
            rooms.forEach((room) => {
                if (room.metadata.location === location) {
                    roomIdFound = room.roomId;
                }
            });

            // if so, let's join it
            if (roomIdFound !== false) {
                return await this.joinRoom(roomIdFound, token, character_id);
            }
        }

        // else create a new room for that location
        return await this._client.create("game_room", {
            location: location,
            token: token,
            character_id: character_id,
        });
    }*/
}
