<template>
    <button @click="quitGame" class="gameControl">QUIT</button>
    <canvas ref="bjsCanvas" class="gameContainer"></canvas>
</template>
  
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from "@vue/runtime-core";
import { createScene } from "../scenes/MyFirstScene.ts";
const router = useRouter()

const quitGame = () => {
    console.log('fdsfsdf');
    router.push(`/lobby`);
}

const bjsCanvas = ref(null);

onMounted(() => {
    if (bjsCanvas.value) {
        createScene(bjsCanvas.value);
    }
});



</script>