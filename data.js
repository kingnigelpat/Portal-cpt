// Initial data constants (fallbacks if cloud is empty)
const defaultNews = [
  {
    category: "Academic",
    title: "Semester Examinations Schedule Released",
    desc: "The final examination timetable for the 2025/2026 academic session is now available for download.",
    date: "March 1st, 2026"
  }
];

const defaultStudents = [
  {
    schoolId: "COMP/2025/001",
    magicToken: "MAGIC123",
    name: "Alex Johnson",
    results: [
      { semester: "1", gpa: "4.00", carryOver: "0", date: "3/2/2026" }
    ]
  }
];

// If cloud isn't loaded yet, use initials
if (!window.newsData || window.newsData.length === 0) window.newsData = defaultNews;
if (!window.studentsDB || window.studentsDB.length === 0) window.studentsDB = defaultStudents;

// The actual syncing logic is now handled by firebase-config.js (onSnapshot)
// and calling window.saveData() will now push to Cloud Firestore.
console.log("Portal Data Framework Primed");
