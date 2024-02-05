import { createRouter, createWebHistory } from "vue-router";

import DefaultLayout from "../layouts/DefaultLayout.vue";

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
            path: "/play",
            meta: { layout: DefaultLayout },
            component: () => import("../views/Play.vue"),
        },
    ],
});

export default router;
