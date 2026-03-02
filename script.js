// Portal initialization and logic
document.addEventListener('DOMContentLoaded', () => {
    // Populate news if grid exists
    const newsGrid = document.getElementById('news-grid');
    if (newsGrid) renderNews();

    // Start hero slideshow
    startSlideshow();

    // Attach search result event
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', handleResultCheck);
    }
});

function startSlideshow() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 4000); // Change image every 4 seconds
}

function renderNews() {
    const newsGrid = document.getElementById('news-grid');
    newsGrid.innerHTML = ''; // Clear for fresh feel

    window.newsData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="label">${item.category}</div>
            <p style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.25rem;">${item.date}</p>
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
        `;
        newsGrid.appendChild(div);
    });
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span style="font-size: 1.2rem;">${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remove toast after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function handleResultCheck() {
    const schoolIdInput = document.getElementById('schoolId');
    const magicTokenInput = document.getElementById('magicToken');
    const errorMsg = document.getElementById('error-msg');
    const checkBtn = document.getElementById('checkBtn');

    const schoolId = schoolIdInput.value.trim().toUpperCase();
    const magicToken = magicTokenInput.value.trim();

    // Reset UI state
    errorMsg.style.display = 'none';
    checkBtn.textContent = 'AUTHENTICATING...';
    checkBtn.disabled = true;

    // Simulate network delay for "premium feel"
    setTimeout(() => {
        // Find matching student
        const student = window.studentsDB.find(s =>
            s.schoolId === schoolId && s.magicToken === magicToken
        );

        if (student) {
            displayResults(student);
        } else {
            errorMsg.style.display = 'block';
            checkBtn.textContent = 'AUTHENTICATE & VIEW RESULTS';
            checkBtn.disabled = false;
        }
    }, 1500);
}

function displayResults(student) {
    const formPanel = document.getElementById('checker-form');
    const resultPanel = document.getElementById('result-panel');
    const nameLabel = document.getElementById('student-name');
    const idLabel = document.getElementById('student-id');
    const gradesContainer = document.getElementById('grades-container');

    // Populate data
    nameLabel.textContent = student.name;
    idLabel.textContent = `School ID: ${student.schoolId}`;

    gradesContainer.innerHTML = '';

    // Handle both new record format and legacy grade format
    if (student.academic_records && student.academic_records.length > 0) {
        student.academic_records.forEach(rec => {
            const row = document.createElement('div');
            row.className = 'grade-pill';
            row.style.flexDirection = 'column';
            row.style.alignItems = 'flex-start';
            row.style.gap = '5px';

            const isSecondSem = rec.semester === "2";

            row.innerHTML = `
                <div style="width: 100%; display: flex; justify-content: space-between; font-weight: 600;">
                    <span>${isSecondSem ? 'SECOND' : 'FIRST'} SEMESTER</span>
                    <span style="color: var(--accent-purple);">${rec.carryOver} CARRY OVER</span>
                </div>
                <div style="width: 100%; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 5px; margin-top: 5px;">
                    <span>GPA: <span class="grade-value" style="color: #6366f1;">${rec.gpa}</span></span>
                    ${isSecondSem ? `<span>CGPA: <span class="grade-value" style="color: #10b981;">${rec.cgpa}</span></span>` : ''}
                </div>
            `;
            gradesContainer.appendChild(row);
        });
    } else if (student.results) {
        student.results.forEach(res => {
            const pill = document.createElement('div');
            pill.className = 'grade-pill';
            pill.innerHTML = `
                <span>${res.subject}</span>
                <span class="grade-value">${res.grade}</span>
            `;
            gradesContainer.appendChild(pill);
        });
    } else {
        gradesContainer.innerHTML = '<p style="color: var(--text-dim); text-align: center; width: 100%;">No results found for this student.</p>';
    }

    // Toggle panels
    formPanel.style.display = 'none';
    resultPanel.style.display = 'block';
}

function resetPortal() {
    const formPanel = document.getElementById('checker-form');
    const resultPanel = document.getElementById('result-panel');
    const checkBtn = document.getElementById('checkBtn');
    const schoolIdInput = document.getElementById('schoolId');
    const magicTokenInput = document.getElementById('magicToken');

    schoolIdInput.value = '';
    magicTokenInput.value = '';
    checkBtn.textContent = 'AUTHENTICATE & VIEW RESULTS';
    checkBtn.disabled = false;

    resultPanel.style.display = 'none';
    formPanel.style.display = 'block';
}
