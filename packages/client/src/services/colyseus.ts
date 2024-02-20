import { Client, Room } from "colyseus.js";

const client = new Colyseus.Client("ws://localhost:3000") as Client;

const create = async (user = {}) => {
    return new Promise<Room>((resolve, reject) => {
        let options = {
            name: user?.displayName,
        };
        return client
            .create("gameroom", options)
            .then((joinedRoom: Room) => {
                resolve(joinedRoom);
            })
            .catch((e: any) => {
                reject();
                console.error("CREATE ERROR", e);
            });
    });
};

const reconnect = async (reconnectionToken = {}) => {
    return new Promise<Room>((resolve, reject) => {
        return client
            .reconnect(reconnectionToken)
            .then((joinedRoom: Room) => {
                resolve(joinedRoom);
            })
            .catch((e: any) => {
                reject();
            });
    });
};

const joinById = async (user: any, roomId: string) => {
    return new Promise<Room>((resolve, reject) => {
        let options = {
            name: user?.displayName,
        };
        return client
            .joinById(roomId, options)
            .then((joinedRoom: Room) => {
                resolve(joinedRoom);
            })
            .catch((e: any) => {
                reject();
                console.error("JOIN ERROR", e);
            });
    });
};

const joinOrCreate = async (store, roomId: string = "", reconnectionToken: string = "") => {
    return new Promise<Room>((resolve, reject) => {
        // check if room already exists
        if (store.currentRoom) {
            console.info("ALREADY JOINED", store.currentRoom);
            resolve(store.currentRoom);
            return;
        }

        /*
        if (reconnectionToken) {
            store.client?.reconnect(reconnectionToken).then((joinedRoom) => {
                resolve(joinedRoom);
            });
        }*/

        //
        store.client.getAvailableRooms("gameroom").then((rooms) => {
            console.info("ROOMS EXISTING", rooms);
            let foundRoom = false;
            rooms.forEach((room) => {
                if (room.roomId === roomId) {
                    foundRoom = room;
                }
            });
            if (foundRoom) {
                store.client
                    .joinById(foundRoom.roomId, store.user)
                    .then((joinedRoom: Room) => {
                        console.info("JOIN SUCCESS", joinedRoom);
                        resolve(joinedRoom);
                    })
                    .catch((e: any) => {
                        console.error("JOIN ERROR", e);
                    });
            } else {
                store.client
                    .create("gameroom", {
                        roomId: roomId,
                        displayName: store.user.displayName,
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
};

export { joinOrCreate, create, reconnect };
