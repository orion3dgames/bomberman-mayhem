import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// Import our custom CSS
import "./scss/style.scss";

// Import all of Bootstrap's JS
import { Dropdown } from "bootstrap";

if (location.hostname === "localhost") {
    //connectAuthEmulator(getAuth(), "http://localhost:9099");
}

const app = createApp(App);

app.use(router);

app.mount("#app");
