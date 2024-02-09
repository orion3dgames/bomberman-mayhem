<template>
    <button @click="quitGame" class="gameControl">QUIT</button>
    <canvas ref="bjsCanvas" class="gameContainer"></canvas>
</template>
  
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from "@vue/runtime-core";
import { GameController } from "../scenes/MyFirstScene.ts";
import { joinOrCreate } from "../services/colyseus";
import { useStore } from '../store';

const router = useRouter();
const store = useStore();
const bjsCanvas = ref(null);
const roomId = router.currentRoute.value.params.roomId as string;

// if no room (direct link), create the room
if (store.room && !store.room.roomId) {
  
    joinOrCreate(store.user, roomId).then((room)=>{

        // set room
        store.room = room;

        // initialize BJS
        new GameController(bjsCanvas.value);

    }).catch((error)=>{
        console.error(error);
    }); 
}

onMounted(() => {
    
});

const quitGame = () => {
    store.room.leave();
    router.push(`/lobby`);
}

</script>