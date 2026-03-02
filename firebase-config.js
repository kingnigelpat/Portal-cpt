// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAqVeXjplLd9oT1KKGiq_J7L8IrWhx8Y68",
    authDomain: "portal-cpt.firebaseapp.com",
    projectId: "portal-cpt",
    storageBucket: "portal-cpt.firebasestorage.app",
    messagingSenderId: "996686724362",
    appId: "1:996686724362:web:93def0c83fe9b225120ef3",
    measurementId: "G-Y14QPSM5ZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global data variables (initialized with defaults while cloud loads)
window.newsData = [];
window.studentsDB = [];

// Reference to a single document that holds all our portal data for simplicity (or we can use collections)
// For 100 students, a single "system" doc is fast and easy.
const systemDocRef = doc(db, "portal", "database");

// Function to save data to Cloud Firestore
window.saveData = async function () {
    try {
        await setDoc(systemDocRef, {
            news: window.newsData,
            students: window.studentsDB
        });
        console.log("Cloud Sync Successful");
    } catch (error) {
        console.error("Cloud Sync Failed:", error);
    }
};

// Listen for real-time updates from Cloud Firestore
onSnapshot(systemDocRef, (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        window.newsData = data.news || [];
        window.studentsDB = data.students || [];

        // Trigger UI refreshes depending on which page we are on
        if (typeof renderNews === 'function') renderNews();
        if (typeof loadStats === 'function') loadStats();
        if (typeof populateStudentSelect === 'function') populateStudentSelect();
        if (typeof populateDeleteSelect === 'function') populateDeleteSelect();
        if (typeof populateDirectoryList === 'function') populateDirectoryList();
        if (typeof populatePostsList === 'function') populatePostsList();

        console.log("Database Synced from Cloud");
    } else {
        // First time initialization if cloud is empty
        console.log("Initializing Cloud Storage with defaults...");
        // Use default data from previous data.js logic if needed
        window.saveData();
    }
});
