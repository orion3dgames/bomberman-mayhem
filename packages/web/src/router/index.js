import { createRouter, createWebHistory } from "vue-router";

import { getCurrentUser } from "./auth_guard";
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
            path: "/register",
            meta: { layout: DefaultLayout },
            component: () => import("../views/Register.vue"),
        },
        {
            path: "/sign-in",
            meta: { layout: DefaultLayout },
            component: () => import("../views/SignIn.vue"),
        },
        {
            path: "/lobby",
            meta: { layout: DefaultLayout, requiresAuth: true },
            component: () => import("../views/Lobby.vue"),
        },
        {
            path: "/room/:sessionId",
            meta: { layout: DefaultLayout, requiresAuth: true },
            component: () => import("../views/Room.vue"),
        },
        {
            path: "/game",
            meta: { layout: GameLayout, requiresAuth: true },
            component: () => import("../views/Game.vue"),
        },
    ],
});

// your router file
router.beforeEach(async (to) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    if (requiresAuth && !(await getCurrentUser())) {
        return "/sign-in";
    }
});
export default router;
