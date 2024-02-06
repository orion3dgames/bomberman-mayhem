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
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Room } from 'colyseus.js';

const client = new Colyseus.Client('ws://localhost:3000');
const router = useRouter()
const sessionId = router.currentRoute.value.params.sessionId;

///////////////////////////////////////////////////////
// JOIN ROOM
const joinOrCreate = async (sessionId) => {
    return new Promise<Room>((resolve, reject) => {  
        if(sessionId == 'NEWGAME'){
            return client.create("gameroom", {}).then((joinedRoom:Room) => {
                resolve(joinedRoom);
            }).catch((e: any) => {
                reject();
                console.error("JOIN ERROR", e);
            });
        }else{
            return client.joinById(sessionId).then((joinedRoom:Room) => {
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


const startGame = () => {
    router.push(`/game`);
}


///////////////////////////////////////////////////////
// VUE LIFECYCLE EVENTS
onBeforeUnmount(() => {
    console.log('LEAVING ', room);
    room.leave();
})


</script>