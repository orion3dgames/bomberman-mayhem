<template>
    <h1> Play </h1>
    <hr>
    <table class="table">
        <thead>
            <tr>
            <th scope="col">#</th>
            <th scope="col">First</th>
            <th scope="col">Last</th>
            <th scope="col">Handle</th>
            </tr>
        </thead>
        <tbody>
            <tr>
            <th scope="row">1</th>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
            </tr>
            <tr>
            <th scope="row">2</th>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
            </tr>
            <tr>
            <th scope="row">3</th>
            <td colspan="2">Larry the Bird</td>
            <td>@twitter</td>
            </tr>
        </tbody>
        </table>
</template>
<script setup lang="ts">
import { getAuth,onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { onBeforeUnmount, onMounted } from 'vue'

const router = useRouter()
const authListener = onAuthStateChanged(getAuth(),function(user) {
    if (!user) { // not logged in
        alert('you must be logged in to view this. redirecting to the home page')
        router.push('/')
    }
});

onMounted(()=>{
    var client = new Colyseus.Client('ws://localhost:3000');
        client.joinOrCreate("lobby").then(room => {
        console.log(room.sessionId, "joined", room.name);
    }).catch(e => {
        console.log("JOIN ERROR", e);
    });
})

onBeforeUnmount(() => {

    
    // clear up listener
    authListener()
})
  
</script>