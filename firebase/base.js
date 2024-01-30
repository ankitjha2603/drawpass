// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCehfkvM9oatK0to0nxW6mvwxvL9_Hfsp0",
  authDomain: "draw-password.firebaseapp.com",
  projectId: "draw-password",
  storageBucket: "draw-password.appspot.com",
  messagingSenderId: "686884580564",
  appId: "1:686884580564:web:28ceb27375e33313a09f41",
  measurementId: "G-XWKL0PKG9D",
};
const app = initializeApp(firebaseConfig);
export default app;
export const db = getFirestore(app);
