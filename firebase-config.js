// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Import sensitive config from gitignored file
import { firebaseConfig } from "./env.js";

if (!firebaseConfig || !firebaseConfig.apiKey) {
    console.error("Firebase Configuration Missing! Please create env.js based on env.example.js");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global data variables (initialized with defaults while cloud loads)
window.newsData = [];
window.studentsDB = [];

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

        if (typeof renderNews === 'function') renderNews();
        if (typeof loadStats === 'function') loadStats();
        if (typeof populateStudentSelect === 'function') populateStudentSelect();
        if (typeof populateDeleteSelect === 'function') populateDeleteSelect();
        if (typeof populateDirectoryList === 'function') populateDirectoryList();
        if (typeof populatePostsList === 'function') populatePostsList();

        console.log("Database Synced from Cloud");
    } else {
        console.log("Initializing Cloud Storage with defaults...");
        window.saveData();
    }
});
