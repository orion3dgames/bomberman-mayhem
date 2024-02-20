<template>
  <component :is="$route.meta.layout || 'div'">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { useStore } from './store/index';
import { generateUserName } from "./services/utils";
const store = useStore();

// SET COLYSEUS CLIENT
const client = new Colyseus.Client({ hostname: 'localhost', secure: false, port: 3000 }); 
store.client = client;

// SET DEFAULT USERNAME
let currentName = store.user?.displayName ?? "";
if(!currentName){
  currentName = generateUserName();
  store.setUser(currentName);
}

</script> 