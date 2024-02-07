<template>
    <h1>{{ room.roomId }}</h1>
    <hr />

    <button @click="startGame">Start Game</button>

    <ul> 
       <li v-for="(player, index) in players">
            {{ player.displayName }}
            <span class="badge bg-primary" v-if="player.admin">ADMIN</span>
       </li> 
    </ul>
    {{ players }}
    <hr>
    {{ room }}
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router';
import { onBeforeUnmount, ref } from 'vue';
import { Client, Room } from 'colyseus.js';
import { getAuth } from 'firebase/auth';

const client = new Colyseus.Client('ws://localhost:3000') as Client;
const router = useRouter()
const sessionId = router.currentRoute.value.params.sessionId;

const auth = getAuth();
const user = auth.currentUser;

///////////////////////////////////////////////////////
// JOIN ROOM
const joinOrCreate = async (sessionId) => {
    return new Promise<Room>((resolve, reject) => {  
        let options = {
            name: user?.displayName
        }
        if(sessionId == 'NEWGAME'){
            return client.create("gameroom", options).then((joinedRoom:Room) => {
                resolve(joinedRoom);
            }).catch((e: any) => {
                reject();
                console.error("JOIN ERROR", e);
            });
        }else{
            return client.joinById(sessionId, options).then((joinedRoom:Room) => {
                resolve(joinedRoom);
            }).catch((e: any) => {
                reject();
                console.error("JOIN ERROR", e);
            });
        } 
    });
}

const room = await joinOrCreate(sessionId); 
console.log('ROOM LOADED', room);

///////////////////////////////////////////////////////
// SETUP EVENTS
const players:[] = ref([]);
room.state.players.onAdd((entity, sessionId) => {
    players.value.push(entity)
    console.log('NEW PLAYER', entity, players);
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
    router.push('/game');
});


const startGame = () => {
    room.send('START_GAME_REQUESTED', { roomId: room.roomId})
}


///////////////////////////////////////////////////////
// VUE LIFECYCLE EVENTS
onBeforeUnmount(() => {
    console.log('LEAVING ', room);
    room.leave();
})


</script>