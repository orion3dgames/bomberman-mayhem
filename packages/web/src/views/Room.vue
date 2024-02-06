<template>
    <h1>{{ room.roomId }}</h1>
    <hr>
    {{ room }}
</template>


<script setup lang="ts">

import { useRouter } from 'vue-router'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const client = new Colyseus.Client('ws://localhost:3000');;
const router = useRouter()
const sessionId = router.currentRoute.value.params.sessionId;
const room = ref({});

if(sessionId == 'NEWGAME'){

    client.create("myroom", {}).then((joinedRoom) => {
        console.log(joinedRoom.sessionId, "created", joinedRoom);
        room.value = joinedRoom;
    }).catch((e: any) => {
        console.log("JOIN ERROR", e);
    });

}else{

    client.joinById(sessionId).then((joinedRoom) => {
        console.log(joinedRoom.sessionId, "joined", joinedRoom);
        room.value = joinedRoom;
    }).catch((e: any) => {
        console.log("JOIN ERROR", e);
    });

}


onMounted(()=>{
    
})

onBeforeUnmount(() => {
    console.log('LEAVING ', room);
    room.value.leave();
})

</script>