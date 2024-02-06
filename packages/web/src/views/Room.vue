<template>
    <Suspense>
        <main>
            <Room />
        </main>
        <template #fallback>
            Loading...
        </template>
    </Suspense>
</template>

<script setup lang="ts">
import Room from "../components/InsideRoom.vue";
</script>