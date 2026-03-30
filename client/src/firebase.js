// Firebase configuration module for Frontend
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkROkOHQyvHwRwBx6V2iBcfU9jZ_wiiKc",
  authDomain: "payflow-f49f4.firebaseapp.com",
  projectId: "payflow-f49f4",
  storageBucket: "payflow-f49f4.firebasestorage.app",
  messagingSenderId: "127868338361",
  appId: "1:127868338361:web:c72e312949481648dc1b68",
  measurementId: "G-CYJHGJ6HQG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
