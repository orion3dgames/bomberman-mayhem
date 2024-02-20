<template>

    <div class="container">

        <div class="panel">
            <div v-if="store.currentRoom">

                <button @click="quitGame" class="btn btn-sm bg-secondary">Cancel</button>

                <hr>

                <article class="card">
                    <header>
                        <h3>Room #{{ store.currentRoom.roomId }}</h3>
                    </header>
                </article>

                <div class="col" v-if="players">
                    <h3>Players {{ players.length }} / 4</h3>
                    <ul>
                        <li v-for="(player, index) in players" :class="player.disconnected ? 'disconnected':''">
                            {{ player.displayName }}
                            <span v-if="sessionId === player.sessionId">(YOU)</span>
                        </li>
                    </ul>
                </div>

                <hr>

                <button @click="startGame()" class="btn bg-primary w-100">Start Game</button>
                
            </div>

        </div>
    </div>

    <div v-if="gameStarted">
        <button @click="quitGame" class="gameControl">QUIT</button>
        <canvas id="bjsCanvas" ref="bjsCanvas" class="gameContainer" ></canvas>
    </div>

</template>

<script async setup lang="ts">

import { useRouter } from 'vue-router';
import { onBeforeUnmount, ref, nextTick, onMounted } from 'vue';
import { useStore } from '../store/index';
import { joinOrCreate } from "../services/colyseus";
import { GameController } from "../scenes/MyFirstScene.ts";

const bjsCanvas = ref(null);
const router = useRouter()
const store = useStore();
const roomId = router.currentRoute.value.params.roomId;
const players = ref([]);
const user = store.user;
const sessionId = ref("");
const gameStarted = ref(false);
const connectionKey = "B-reconnectionToken";
const reconnectionToken = localStorage.getItem(connectionKey);

joinOrCreate(store, roomId, reconnectionToken).then((joinedRoom) =>{

    // setup colyseus events
    joinedRoom.state.players.onAdd((entity, sessionId) => {
        console.log('ADDING PLAYER', entity);
        players.value.push(entity);
    });

    joinedRoom.state.players.onRemove((entity, sessionId) => {
        players.value.forEach((element, i) => {
            if(element.sessionId === sessionId){
                console.log('REMOVING PLAYER', entity);
                players.value.splice(i, 1)
            }
        });
    });

    joinedRoom.onMessage('START_GAME', (e)=>{
        console.log('START GAME RECEIVED', bjsCanvas);

        gameStarted.value = true;

        nextTick().then((nextTick) => {
            // initialize BJS
            new GameController(bjsCanvas.value);
        });
        
    });

    sessionId.value = joinedRoom.sessionId;
    store.currentRoom = joinedRoom;

    // reconnection token
    localStorage.setItem(connectionKey, joinedRoom.reconnectionToken);

});

onMounted( async () => {
    
});

const startGame = () => {
    store.currentRoom?.send('START_GAME_REQUESTED', { roomId: store.currentRoom?.roomId })
}


const quitGame = () => {
    router.push('/');
}

onBeforeUnmount(() => {
    console.log('LEAVING ROOM', store.currentRoom);
    store.currentRoom?.leave();
})

</script>