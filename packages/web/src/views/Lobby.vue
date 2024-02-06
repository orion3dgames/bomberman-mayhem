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
import { RoomAvailable } from 'colyseus.js'

const client = new Colyseus.Client('ws://localhost:3000');;
const router = useRouter()
const allRooms = reactive<RoomAvailable[]>([]);
const lobby = ref({});

onMounted(()=>{

    client.joinOrCreate("lobby").then(lobbyJoined => {

        lobby.value = lobbyJoined;

        console.log(lobbyJoined.sessionId, "joined", lobbyJoined.name);

        lobbyJoined.onMessage("rooms", (rooms) => {
            rooms.forEach(room => {
                allRooms.push(room);
            });
        });

        lobbyJoined.onMessage("+", ([roomId, room]) => {
            const roomIndex = allRooms.findIndex((room) => room.roomId === roomId);
            if (roomIndex !== -1) {
                allRooms[roomIndex] = room;

            } else {
                allRooms.push(room);
            }
        });

        lobbyJoined.onMessage("-", (roomId) => {
            allRooms.forEach(room => {
                if(room.roomId === roomId) {
                    allRooms.splice(-1, 1);
                }
            });
        });

    }).catch(e => {
        console.log("JOIN ERROR", e);
    });

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