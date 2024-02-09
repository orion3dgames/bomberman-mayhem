<template>
    <button @click="quitGame" class="btn btn-sm bg-secondary float-end">Cancel</button> &nbsp;
    <h5 class="float-start">Room #{{ room.roomId }}</h5>
    
    <hr />

    <div class="row">
         <div class="col">
            <h3>Players {{ players.length }} / 4</h3>
            <div class="list-group">
                <a href="#" class="list-group-item list-group-item-action list-group-item-dark" v-for="(player, index) in players">
                    {{ player.displayName }}
                    <span class="badge bg-primary" v-if="player.admin">C</span>
                </a>
            </div>
         </div>
         <div class="col">
            <div class="float-end">
                <button @click="startGame()" class="btn bg-primary">Start Game</button>
            </div>
         </div>
    </div>

    <hr>
    {{ room }}
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router';
import { onBeforeUnmount, ref } from 'vue';
import { Client, Room } from 'colyseus.js';
import { getAuth } from 'firebase/auth';
import { useStore } from '../store/index';
import { joinOrCreate } from '../services/colyseus';

const router = useRouter()
const roomId = router.currentRoute.value.params.roomId as string;

const auth = getAuth();
const user = auth.currentUser;
const store = useStore();

///////////////////////////////////////////////////////
// JOIN ROOM
const room = await joinOrCreate(roomId, user); 

// set store;
store.user = user;
store.room = room;

///////////////////////////////////////////////////////
// SETUP EVENTS
const players:[] = ref([]);
room.state.players.onAdd((entity, sessionId) => {
    players.value.push(entity)
});
room.state.players.onRemove((entity, sessionId) => {
    players.value.forEach((element, i) => {
        if(element.sessionId === sessionId){
            players.value.splice(i, 1)
        }
    });
});

room.onMessage('START_GAME', (e)=>{
    console.log('START GAME RECEIVED', e);
    router.push(`/game/${room.roomId}`);
});


const startGame = () => {
    room.send('START_GAME_REQUESTED', { roomId: room.roomId })
}

const quitGame = () => {
    router.push('/lobby');
}

///////////////////////////////////////////////////////
// VUE LIFECYCLE EVENTS
onBeforeUnmount(() => {
    //console.log('LEAVING ', room);
    //room.leave();
})


</script>