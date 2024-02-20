import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { join } from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), nodePolyfills()],
    server: {
        port: 8080,
        hot: true,
    },
    base: "./",
    resolve: {
        alias: {
            "@": join(__dirname, "src"),
        },
    },
    define: {
        "process.env": {},
    },
});
