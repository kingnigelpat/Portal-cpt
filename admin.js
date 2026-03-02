// Admin Power Base Logic

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loadStats();
    populateStudentSelect();
    populateDeleteSelect();
    populateDirectoryList();
    populatePostsList();
});

function checkSession() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        const loginGate = document.getElementById('admin-login-gate');
        const adminLayout = document.getElementById('main-admin-layout');
        if (loginGate && adminLayout) {
            loginGate.style.display = 'none';
            adminLayout.style.visibility = 'visible';
            document.body.style.overflow = 'auto';
        }
    }
}

function populateDirectoryList() {
    const tableBody = document.getElementById('directory-list');
    const searchTerm = document.getElementById('directory-search').value.toLowerCase();

    if (!tableBody) return;

    tableBody.innerHTML = '';

    const filtered = window.studentsDB.filter(s =>
        s.name.toLowerCase().includes(searchTerm) ||
        s.schoolId.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--text-dim);">No students found matching your search.</td></tr>';
        return;
    }

    filtered.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 1rem; border-bottom: 1px solid var(--admin-border-solid); font-weight: 500;">${student.name}</td>
            <td style="padding: 1rem; border-bottom: 1px solid var(--admin-border-solid); color: var(--text-dim);">${student.schoolId}</td>
            <td style="padding: 1rem; border-bottom: 1px solid var(--admin-border-solid); font-family: monospace; font-size: 1.1rem; color: #6366f1;">${student.magicToken}</td>
            <td style="padding: 1rem; border-bottom: 1px solid var(--admin-border-solid);">
                <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem; width: auto; background: var(--admin-border-solid);" onclick="copyToClipboard('${student.magicToken}')">COPY</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Token copied to clipboard!");
    });
}

function populatePostsList() {
    const list = document.getElementById('posts-list');
    const countDisplay = document.getElementById('news-count-display');
    if (!list) return;

    list.innerHTML = '';
    countDisplay.textContent = window.newsData.length;

    if (window.newsData.length === 0) {
        list.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 2rem;">No active broadcasts found.</p>';
        return;
    }

    window.newsData.forEach((news, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'background: var(--admin-bg-solid); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--admin-border-solid); display: flex; justify-content: space-between; align-items: center;';
        item.innerHTML = `
            <div style="flex: 1;">
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 0.5rem;">
                    <span style="background: var(--admin-card-solid); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; color: var(--accent-admin); text-transform: uppercase;">${news.category}</span>
                    <span style="color: var(--text-dim); font-size: 0.75rem;">${news.date}</span>
                </div>
                <h4 style="margin-bottom: 0.25rem;">${news.title}</h4>
                <p style="color: var(--text-dim); font-size: 0.85rem; line-height: 1.4;">${news.desc.substring(0, 100)}${news.desc.length > 100 ? '...' : ''}</p>
            </div>
            <button class="btn-primary" style="width: auto; background: #ef4444; padding: 0.5rem 1.25rem; font-size: 0.8rem; margin-left: 1.5rem;" onclick="deleteNews(${index})">DELETE</button>
        `;
        list.appendChild(item);
    });
}

function deleteNews(index) {
    const title = window.newsData[index].title;
    if (confirm(`Are you sure you want to delete this post: "${title}"?`)) {
        window.newsData.splice(index, 1);
        window.saveData();
        logActivity(`Deleted News: ${title}`);
        loadStats();
        populatePostsList();
        showToast("Post removed successfully.");
    }
}

function populateDeleteSelect() {
    const select = document.getElementById('delete-student-select');
    if (!select) return;
    select.innerHTML = '<option value="">-- Select Student to Remove --</option>';
    window.studentsDB.forEach(student => {
        const opt = document.createElement('option');
        opt.value = student.schoolId;
        opt.textContent = `${student.name} (${student.schoolId})`;
        select.appendChild(opt);
    });
}

function deleteStudent() {
    const studentId = document.getElementById('delete-student-select').value;
    const confirmPass = document.getElementById('delete-confirm-pass').value;

    if (!studentId) return showToast("Select a student to delete.", 'error');
    if (confirmPass !== "PRSHED") return showToast("Security Confirmation Failed: Incorrect Admin Password.", 'error');

    const index = window.studentsDB.findIndex(s => s.schoolId === studentId);
    if (index !== -1) {
        const studentName = window.studentsDB[index].name;
        if (confirm(`FINAL WARNING: Are you absolutely sure you want to delete ${studentName}? This cannot be undone.`)) {
            window.studentsDB.splice(index, 1);
            window.saveData();
            logActivity(`DELETED STUDENT: ${studentName} (${studentId})`);
            loadStats();
            populateStudentSelect();
            populateDeleteSelect();
            populateDirectoryList();
            showToast("Student Record Permanently Removed.");
            document.getElementById('delete-confirm-pass').value = '';
        }
    }
}

function verifyAdmin() {
    const password = document.getElementById('adminPassword').value;
    const errorMsg = document.getElementById('login-error');
    const loginGate = document.getElementById('admin-login-gate');
    const adminLayout = document.getElementById('main-admin-layout');

    if (password.toUpperCase() === 'PRSHED') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        loginGate.style.display = 'none';
        adminLayout.style.visibility = 'visible';
        document.body.style.overflow = 'auto';
    } else {
        errorMsg.style.display = 'block';
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
}

function showSection(element, id) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(id).classList.add('active');
    element.classList.add('active');
}

function autoFillVerification() {
    const studentId = document.getElementById('result-student').value;
    const nameInput = document.getElementById('res-st-name');
    const idInput = document.getElementById('res-st-id');

    if (!studentId) {
        nameInput.value = '';
        idInput.value = '';
        return;
    }

    const student = window.studentsDB.find(s => s.schoolId === studentId);
    if (student) {
        nameInput.value = student.name;
        idInput.value = student.schoolId;
    }
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

function loadStats() {
    if (!window.studentsDB || !window.newsData) return;
    document.getElementById('stat-students').textContent = window.studentsDB.length;
    document.getElementById('stat-news').textContent = window.newsData.length;

    let totalResults = 0;
    window.studentsDB.forEach(s => {
        if (s.results) totalResults += s.results.length;
        if (s.academic_records) totalResults += s.academic_records.length;
    });
    document.getElementById('stat-results').textContent = totalResults;
}

function populateStudentSelect() {
    const select = document.getElementById('result-student');
    if (!select) return; // Safety check
    select.innerHTML = '<option value="">-- Select Student --</option>';
    window.studentsDB.forEach(student => {
        const opt = document.createElement('option');
        opt.value = student.schoolId;
        opt.textContent = `${student.name} (${student.schoolId})`;
        select.appendChild(opt);
    });
}

function submitNews() {
    const title = document.getElementById('news-title').value;
    const category = document.getElementById('news-category').value;
    const content = document.getElementById('news-content').value;

    if (!title || !content) return alert("Please fill all fields");

    const newEntry = {
        category,
        title,
        desc: content,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    window.newsData.unshift(newEntry);
    window.saveData();
    logActivity(`Published News: ${title}`);
    loadStats();
    populatePostsList();
    showToast("News Published Successfully!");

    // Reset fields
    document.getElementById('news-title').value = '';
    document.getElementById('news-content').value = '';
}

// Result submission logic moved to new GPA/CGPA system

function toggleMetricLabel() {
    const sem = document.getElementById('res-semester').value;
    const cgpaCont = document.getElementById('cgpa-container');
    const label = document.getElementById('metric-label');

    if (sem === "2") {
        label.textContent = "Second Semester GPA";
        cgpaCont.style.display = "block";
    } else {
        label.textContent = "GPA Score";
        cgpaCont.style.display = "none";
    }
}

function submitResult() {
    const name = document.getElementById('res-st-name').value.trim();
    const id = document.getElementById('res-st-id').value.trim().toUpperCase();
    const sem = document.getElementById('res-semester').value;
    const val = document.getElementById('res-value').value;
    const cgpa = document.getElementById('res-cgpa').value;
    const carryOver = document.getElementById('res-carry-over').value;

    if (!name || !id || !val) return showToast("Please fill all required verification fields.", 'error');

    // Find student in DB
    const student = window.studentsDB.find(s => s.schoolId === id);
    if (!student) return showToast("Student ID not found in database. Register student first.", 'error');

    // Verify Name Match (Soft Check)
    if (!student.name.toLowerCase().includes(name.toLowerCase())) {
        if (!confirm(`Warning: Name provided (${name}) does not perfectly match database (${student.name}). Proceed anyway?`)) return;
    }

    const resultData = {
        semester: sem,
        gpa: val,
        carryOver: carryOver,
        date: new Date().toLocaleDateString()
    };

    if (sem === "2") {
        if (!cgpa) return showToast("Please enter sessional CGPA for second semester.", "error");
        resultData.cgpa = cgpa;
    }

    // Update Student Record
    if (!student.academic_records) student.academic_records = [];
    student.academic_records.unshift(resultData);

    window.saveData();
    logActivity(`Uploaded Result: Sem ${sem} for ${student.name} (${carryOver} Carry Over)`);
    loadStats();

    showToast(`Success: Results for ${student.name} have been broadcasted.`);

    // Reset fields
    document.getElementById('res-st-name').value = '';
    document.getElementById('res-st-id').value = '';
    document.getElementById('res-value').value = '';
    document.getElementById('res-cgpa').value = '';
    document.getElementById('result-student').value = '';
}

function generateToken() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous characters
    let token = '';
    for (let i = 0; i < 8; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('reg-token').value = token;
}

function registerStudent() {
    const name = document.getElementById('reg-name').value.trim();
    const id = document.getElementById('reg-id').value.trim().toUpperCase();
    const token = document.getElementById('reg-token').value.trim();

    if (!name || !id || !token) return showToast("Please fill all registration fields", 'error');

    // Check for duplicates
    if (window.studentsDB.some(s => s.schoolId === id)) {
        return showToast("This School ID is already registered!", 'error');
    }

    const newStudent = {
        schoolId: id,
        magicToken: token,
        name: name,
        results: [],
        academic_records: []
    };

    window.studentsDB.push(newStudent);
    window.saveData();
    logActivity(`Registered Student: ${name} (${id})`);
    loadStats();
    populateStudentSelect();
    populateDeleteSelect();
    populateDirectoryList();

    showToast("Student Registered in Database!");

    // Reset fields
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-id').value = '';
    document.getElementById('reg-token').value = '';
}

function logActivity(text) {
    const log = document.getElementById('activity-log');
    const p = document.createElement('p');
    p.style.color = '#10b981';
    p.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    log.prepend(p);
}
