import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

/* code from our Firebase console */
const firebaseConfig = {
    apiKey: "AIzaSyBvrFWbKRHZNcxguGNCX4zV3MCosxVcCDk",
    authDomain: "bomberman-mayhem.firebaseapp.com",
    projectId: "bomberman-mayhem",
    storageBucket: "bomberman-mayhem.appspot.com",
    messagingSenderId: "868406895398",
    appId: "1:868406895398:web:a6be0981c4a7f4220157e7",
};

// Initialize Firebase
initializeApp(firebaseConfig);

if (location.hostname === "localhost") {
    //connectAuthEmulator(getAuth(), "http://localhost:9099");
}

const app = createApp(App);

app.use(router);

app.mount("#app");
