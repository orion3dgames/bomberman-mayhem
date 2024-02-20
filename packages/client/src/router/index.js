import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import GameLayout from "../layouts/GameLayout.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            meta: { layout: DefaultLayout },
            component: () => import("../views/Home.vue"),
        },
        {
            path: "/play/:roomId",
            meta: { layout: DefaultLayout, requiresAuth: true },
            component: () => import("../views/Play.vue"),
        },
    ],
});

export default router;
