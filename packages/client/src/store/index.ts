import { defineStore } from "pinia";
import { Client, Room } from "colyseus.js";

type User = {
    displayName: string;
};

export const useStore = defineStore("storeId", {
    // arrow function recommended for full type inference
    state: () => {
        return {
            // all these properties will have their type inferred automatically
            client: null as Client | null,
            user: null as User | null,
            rooms: [],
            currentRoom: null as Room | null,
            players: [],
        };
    },

    getters: {},

    actions: {
        ////////////////////////////////////
        // LOBBY
        formatRooms(rooms: []) {
            this.rooms = [];
            rooms.forEach((room) => {
                this.rooms.push(room);
            });
            console.log("ALL ROOMS", this.rooms);
        },

        addRoom(room: Room) {
            const roomIndex = this.rooms.findIndex((r) => r.roomId === room.roomId);
            if (roomIndex !== -1) {
                this.rooms[roomIndex] = room;
                console.log("UPDATE ROOM", room);
            } else {
                console.log("NEW ROOM", room);
                this.rooms.push(room);
            }
        },

        removeRoom(roomId: string) {
            this.rooms.forEach((room) => {
                if (room.roomId === roomId) {
                    this.rooms.splice(-1, 1);
                }
            });
            console.log("REMOVING ROOM", roomId);
        },

        ////////////////////////////////////
        // USER
        setUser(displayName: string) {
            this.user = {
                displayName: displayName,
            };
        },
    },
});
