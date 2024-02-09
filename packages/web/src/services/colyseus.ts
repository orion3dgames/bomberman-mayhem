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

const joinOrCreate = async (user = {}, roomId: string | boolean = false) => {
    return new Promise<Room>((resolve, reject) => {
        let options = {
            name: user?.displayName,
        };
        if (roomId) {
            options.roomId = roomId;
            return client
                .create("gameroom", options)
                .then((joinedRoom: Room) => {
                    resolve(joinedRoom);
                })
                .catch((e: any) => {
                    reject();
                    console.error("JOIN ERROR", e);
                });
        } else {
            return client
                .joinById(roomId, options)
                .then((joinedRoom: Room) => {
                    resolve(joinedRoom);
                })
                .catch((e: any) => {
                    reject();
                    console.error("JOIN ERROR", e);
                });
        }
    });
};

export { joinOrCreate, create };
