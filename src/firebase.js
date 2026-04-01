import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmbziN-TV7wF-Z7FJkDKb84gJoLKOyHms",
  authDomain: "moviltech-9899f.firebaseapp.com",
  projectId: "moviltech-9899f",
  storageBucket: "moviltech-9899f.firebasestorage.app",
  messagingSenderId: "928753764709",
  appId: "1:928753764709:web:a62838332fb0e4e158798c",
  measurementId: "G-VV9SB9C2Y4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
