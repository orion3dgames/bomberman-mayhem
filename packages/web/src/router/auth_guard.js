import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBvrFWbKRHZNcxguGNCX4zV3MCosxVcCDk",
    authDomain: "bomberman-mayhem.firebaseapp.com",
    projectId: "bomberman-mayhem",
    storageBucket: "bomberman-mayhem.appspot.com",
    messagingSenderId: "868406895398",
    appId: "1:868406895398:web:a6be0981c4a7f4220157e7",
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export function getCurrentUser() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                unsubscribe();
                resolve(user);
            },
            reject
        );
    });
}

export async function login() {
    await signInWithEmailAndPassword(auth, "user@mail.com", "password");
}

export async function logout() {
    await signOut(auth);
}
