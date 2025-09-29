import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyABE5a_sFzBDtOQOpkqhlPycbK2SObDdTA",
  authDomain: "paozinhodelicia-6adc3.firebaseapp.com",
  projectId: "paozinhodelicia-6adc3",
  storageBucket: "paozinhodelicia-6adc3.firebasestorage.app",
  messagingSenderId: "936122905798",
  appId: "1:936122905798:web:dfa1a7b9430bc0bfd953c7",
  measurementId: "G-87FX0LFWFX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword };
export default auth;
