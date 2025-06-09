// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Ganti dengan konfigurasi proyek Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyA3mQLT29RwvUKTSZZThd-AtOV6sDGMGok",
    authDomain: "ecoguard-project.firebaseapp.com",
    projectId: "ecoguard-project",
    storageBucket: "ecoguard-project.firebasestorage.app",
    messagingSenderId: "729127717768",
    appId: "1:729127717768:web:4a8e1a9c491cd6c3cc483d",
    measurementId: "G-Z56V0H4XRE"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor layanan Firebase yang akan kita gunakan di seluruh aplikasi
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;