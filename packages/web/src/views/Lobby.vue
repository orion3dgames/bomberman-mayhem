<template>
    <button @click="createGame" class="btn bg-primary">Create Game</button>
    <hr>
    <table class="table table-sm table-dark" v-if="allRooms.length > 0">
        <thead>
            <tr>
                <th>Name</th>
                <th>Players</th>
                <th>Map</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(room, index) in allRooms">
                <td>#{{room.roomId }}</td>
                <td>{{room.clients}}/4</td>
                <td>Square</td>
                <td ><button @click="joinGame(room.roomId)" class="btn btn-sm bg-primary float-end">Join</button></td>
            </tr>
        </tbody>
    </table>
    <div v-else>No Rooms Available...</div>

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
    router.push(`/create`);
}
  
</script>