import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { generateUserName } from "../../../shared/Utils/Utils";

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

export async function loginAnonymously() {
    let connected = await signInAnonymously(auth);
    if (!connected.user.displayName) {
        await updateProfile(auth.currentUser, {
            displayName: generateUserName(),
        });
    }
}

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
