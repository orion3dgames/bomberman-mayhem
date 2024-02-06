<script setup lang="ts">
import { getAuth,onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { reactive, onBeforeUnmount, onMounted } from 'vue'
import { RoomAvailable, Room } from 'colyseus.js'


const client = new Colyseus.Client('ws://localhost:3000');;
const router = useRouter()
const authListener = onAuthStateChanged(getAuth(),function(user) {
    if (!user) { // not logged in
        alert('you must be logged in to view this. redirecting to the home page')
        router.push('/')
    }
});

const allRooms = reactive<RoomAvailable[]>([]);

onMounted(()=>{

    client.joinOrCreate("lobby").then(lobby => {

        console.log(lobby.sessionId, "joined", lobby.name);

        lobby.onMessage("rooms", (rooms) => {
            rooms.forEach(room => {
                allRooms.push(room);
            });
            console.log('ALL ROOMS', allRooms);
        });

        lobby.onMessage("+", ([roomId, room]) => {
            console.log(allRooms);
            const roomIndex = allRooms.findIndex((room) => room.roomId === roomId);
            if (roomIndex !== -1) {
                allRooms[roomIndex] = room;

            } else {
                allRooms.push(room);
            }
            console.log('NEW/UPDATED ROOM', room);
        });

        lobby.onMessage("-", (roomId) => {
            allRooms = allRooms.filter((room) => room.roomId !== roomId);
            console.log('REMOVING ROOM', roomId);
        });

    }).catch(e => {
        console.log("JOIN ERROR", e);
    });

})

onBeforeUnmount(() => {

    // clear up listener
    authListener()
})


const createGame = () => {
    client.joinOrCreate("myroom", {
        name: "Jake",
        map: "de_dust2"
    })
} 
  
</script>

<template>
    <h1> Play </h1>
    <hr>
    <button @click="createGame">Create Game</button>
    <hr>
    {{ allRooms }}
    <ul>
        <li v-for="(room, index) in allRooms">
            {{room.sessionId }}
        </li>
    </ul>
</template>
