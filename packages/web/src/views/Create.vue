<template>
    
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router';
import { getAuth } from 'firebase/auth';
import { useStore } from '../store/index';
import { create } from '../services/colyseus';

const router = useRouter()
const auth = getAuth();
const user = auth.currentUser;
const store = useStore();

// set store;
store.user = user;

create(user).then((room) =>{
    store.room = room;
    router.push(`/room/${room.roomId}`);
}); 

</script>