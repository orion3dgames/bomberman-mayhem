<template>

    <div class="container">

        <div class="panel">
            Pick your name:
            <input type="text" placeholder="Name" v-model="user.displayName" 
             @input="inputChange(user.displayName)"/>
        </div>
 
        <div class="panel" v-if="showWarningMessage">
            {{ warningMessage }}
        </div>
        
        
        <div class="panel">
            <button @click="createGame()" class="btn bg-primary">Create Game</button>
            <hr>
            <div v-if="store.rooms.length > 0" style="overflow-y: scroll; max-height:  600px;">
                <table class="table table-sm table-dark" width="100%" >
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Players</th>
                            <th>Map</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(room, index) in store.rooms">
                            <td>#{{room.roomId }}</td>
                            <td><span>{{ room.clients }}/4</span></td>
                            <td>Square</td>
                            <td><button @click="joinGame(room.roomId)" class="btn btn-sm bg-primary float-end">Join</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else>No Rooms Available...</div>

        </div>
    </div>

</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { reactive, ref, onBeforeUnmount, onMounted } from 'vue'
import { useStore } from '../store/index';
import { Room } from "colyseus.js";

const router = useRouter()
const allRooms = reactive([]);
const warningMessage = ref('');
const showWarningMessage = ref(false);
const lobby = ref({});
const store = useStore();

// USER
const user = store.user;

// LOBBY COLYSEUS
store.client.joinOrCreate("lobby").then(lobbyJoined => {

    lobby.value = lobbyJoined;

    console.log(lobbyJoined.sessionId, "joined", lobbyJoined.name);

    lobbyJoined.onMessage("rooms", (rooms:[]) => {
        store.formatRooms(rooms);
    });

    lobbyJoined.onMessage("+", ([roomId, room]) => {
        store.addRoom(room);
    });

    lobbyJoined.onMessage("-", (roomId) => {
        store.removeRoom(roomId);
    });

}).catch(e => {
    console.log("JOIN ERROR", e);
});

///////////////////////////////

const joinGame = (roomId) => {
    if(store.client){
        
        // leave lobby
        lobby.value.leave();

        //
        let options = {
            name: store.user?.displayName,
            roomId: roomId,
        };
        store.client
            .joinById(roomId, options)
            .then((joinedRoom: Room) => {
               store.currentRoom = joinedRoom;
               router.push(`/play/${joinedRoom.roomId}`);
            })
            .catch((e: any) => {
                console.error("JOIN ERROR", e);
                showWarningMessage.value = true;
                warningMessage.value = e;
                setTimeout(()=>{
                    showWarningMessage.value = false;
                }, 1000)
            });
    }
}

const inputChange = (currentName:string) => {
    store.setUser(currentName);
}

const createGame = () => {
    if(store.client){
        
        // leave lobby
        lobby.value.leave();

        //
        let options = {
            name: store.user?.displayName,
        };
        store.client
            .create("gameroom", options)
            .then((joinedRoom: Room) => {
               store.currentRoom = joinedRoom;
               router.push(`/play/${joinedRoom.roomId}`);
            })
            .catch((e: any) => {
                console.error("JOIN ERROR", e);
            });
    }
}

  
</script>