<template>

      <!--
        <div>
        <div class="container mb-3">
          <nav class="navbar navbar-expand-lg d-flex flex-wrap bg-body-tertiary">

            <a href="/" class="d-flex mx-4">
              Bomberman Mayhem
            </a>

            <ul class="nav me-auto">
              <li><router-link to="/" class="nav-link px-2 link-secondary">Home</router-link></li>
              <li v-if="isLoggedIn"><router-link to="/lobby" class="nav-link px-2 link-body-emphasis">Lobby</router-link></li>
            </ul>

            <div class="d-flex" v-if="isLoggedIn">
              
              <router-link to="/register" class="btn btn-primary">{{ loggedInUser.displayName }}</router-link> 
              <router-link to="/register" class="btn btn-secondary" @click="handleSignOut">Sign Out</router-link> 
            </div>

            <div class="d-flex" v-else>
                <router-link to="/register" class="btn btn-primary"> Register </router-link> 
                <router-link to="/sign-in" class="btn btn-primary"> Login </router-link>
            </div>

          </nav>
        </div>
       
        <div class="container">
          <router-view />
        </div>
    </div>
    -->
  <div style="padding: 15px; border-bottom: 1px solid #EEEE;;">
    <router-link to="/" class="logo">SOMETHING</router-link>
    <span class="badge bg-primary float-end">{{ auth.currentUser.displayName }}</span>
  </div>
  <div style="padding: 15px;">
    <router-view />
  </div>
</template>
<script setup>
import { ref, watchEffect } from 'vue' // used for conditional rendering
import { getAuth,onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'

const auth = getAuth();
const router = useRouter()
const isLoggedIn = ref(true)
const loggedInUser = ref({});

// runs after firebase is initialized
onAuthStateChanged(getAuth(),function(user) {
  loggedInUser.value = user;
    if (user) {
      
      isLoggedIn.value = true // if we have a user
    } else {
      isLoggedIn.value = false // if we do not
    }
})

const handleSignOut = () => {
  signOut(getAuth())
  router.push('/')
}
</script>