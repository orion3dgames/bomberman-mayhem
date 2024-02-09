import { defineStore } from "pinia";
import { User } from "firebase/auth";

export const useStore = defineStore("storeId", {
    // arrow function recommended for full type inference
    state: () => {
        return {
            // all these properties will have their type inferred automatically
            user: {} as User,
            room: {},
        };
    },
    actions: {
        // since we rely on `this`, we cannot use an arrow function
        increment() {},
    },
});
