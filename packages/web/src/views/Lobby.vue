<template>
    <h1> Play </h1>
    <hr>
    <button @click="createGame">Create Game</button>
    <hr>
   
    <table class="table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Clients</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(room, index) in allRooms">
                <td>{{room.roomId }}</td>
                <td>{{room.clients }}</td>
                <td><button @click="joinGame(room.roomId)">Join Game</button></td>
            </tr>
        </tbody>
    </table>

    {{ allRooms }}

</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { reactive, ref, onBeforeUnmount, onMounted } from 'vue'
import { RoomAvailable, Client } from 'colyseus.js'


const router = useRouter()
const allRooms = reactive<RoomAvailable[]>([]);
const lobby = ref({});

const client = new Colyseus.Client({ hostname: 'localhost', secure: false, port: 3000 }); 

client.joinOrCreate("lobby").then(lobbyJoined => {

    lobby.value = lobbyJoined;

    console.log(lobbyJoined.sessionId, "joined", lobbyJoined.name);

    lobbyJoined.onMessage("rooms", (rooms) => {
        rooms.forEach(room => {
            allRooms.push(room);
        });
        console.log("ALL ROOMS", allRooms);
    });

    lobbyJoined.onMessage("+", ([roomId, room]) => {
        const roomIndex = allRooms.findIndex((room) => room.roomId === roomId);
        if (roomIndex !== -1) {
            allRooms[roomIndex] = room;

        } else {
            allRooms.push(room);
        }
        console.log("NEW/UPDATE ROOM", room);
    });

    lobbyJoined.onMessage("-", (roomId) => {
        allRooms.forEach(room => {
            if(room.roomId === roomId) {
                allRooms.splice(-1, 1);
            }
        });
        console.log("REMOVING ROOM", roomId);
    });

}).catch(e => {
    console.log("JOIN ERROR", e);
});

onMounted(()=>{


})

onBeforeUnmount(() => {
    lobby.value.leave();
})

const joinGame = (roomId) => {
    router.push(`/room/${roomId}`);
}

const createGame = () => {
    let sessionId = "NEWGAME";
    router.push(`/room/${sessionId}`);
}
  
</script>