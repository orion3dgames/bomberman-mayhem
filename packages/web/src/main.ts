import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { loginAnonymously, auth } from "./router/auth_guard";

// Import our custom CSS
import "./scss/style.scss";

// Import all of Bootstrap's JS
import { Dropdown } from "bootstrap";

if (location.hostname === "localhost") {
    //connectAuthEmulator(getAuth(), "http://localhost:9099");
}

// login anonymously if not connected
if (!auth.currentUser) {
    await loginAnonymously();
}

const app = createApp(App);

app.use(router);

app.mount("#app");
