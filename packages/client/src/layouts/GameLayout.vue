<template>
    <router-view />
</template>
<script setup>
import { ref, watchEffect } from 'vue' // used for conditional rendering
import { useRouter } from 'vue-router'

const router = useRouter()

</script>