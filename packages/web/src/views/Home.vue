<template>
    <button @click="go" class="btn bg-primary">NEXT PAGE</button>
</template>



<script setup lang="ts">
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'

const router = useRouter()

const go = () => {
    router.push(`/lobby`);
}
  
</script>