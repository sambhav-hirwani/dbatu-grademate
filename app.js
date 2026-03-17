let subjects = [];
let semesters = [];
let admissionType = null;

// Grade to grade point mapping
const gradePoints = {
    EX: 10, AA: 9, AB: 8.5, BB: 8, BC: 7.5, 
    CC: 7, CD: 6.5, DD: 6, DE: 5.5, EE: 5, 
    FF: 0, AU: 0
};

// Start the app when "Start" button is clicked
function startApp() {
    const admission = document.querySelector('input[name="admission"]:checked');
    if (!admission) {
        alert("Select admission type");
        return;
    }

    let selectedType = admission.value;

    if (admissionType && admissionType !== selectedType) {
        let confirmReset = confirm("Changing admission type will reset all saved data. Continue?");
        if (!confirmReset) return;
        semesters = [];
        subjects = [];
        localStorage.removeItem("dbatuGradeMate");
        document.getElementById("results").innerHTML = "";
    }

    admissionType = selectedType;
    localStorage.setItem("admissionType", admissionType);

    let sems = (admissionType === "regular") ? [1, 2, 3, 4, 5, 6, 7, 8] : [3, 4, 5, 6, 7, 8];

    const select = document.getElementById("semesterSelect");
    select.innerHTML = "";
    sems.forEach(s => {
        let option = document.createElement("option");
        option.value = s;
        option.text = "Semester " + s;
        select.appendChild(option);
    });

    document.getElementById("mainApp").style.display = "block";
}

// Fixed Dark Mode Logic
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const btn = document.querySelector('.dark-toggle');
    if (document.body.classList.contains('dark-mode')) {
        btn.textContent = '☀️';
    } else {
        btn.textContent = '🌙';
    }
}

// Add subject to temporary list
function addSubject() {
    const creditInput = document.getElementById("credit");
    const gradeInput = document.getElementById("grade");
    const credit = parseFloat(creditInput.value);
    const grade = gradeInput.value;

    if (!credit || !grade) {
        alert("Enter credit and grade");
        return;
    }

    subjects.push({ credit, grade });
    renderSubjects();

    creditInput.value = "";
    gradeInput.value = "";
}

// Show added subjects with a delete option
function renderSubjects() {
    const list = document.getElementById("subjectList");
    list.innerHTML = "";
    subjects.forEach((sub, index) => {
        let li = document.createElement("li");
        li.innerHTML = `<span>Credit: ${sub.credit} | Grade: ${sub.grade}</span> 
                        <button class="danger" style="padding:2px 8px; margin-left:10px;" onclick="deleteSubject(${index})">X</button>`;
        list.appendChild(li);
    });
}

function deleteSubject(index) {
    subjects.splice(index, 1);
    renderSubjects();
}

// Calculate and Store Semester Data
function calculateSemester() {
    let semester = parseInt(document.getElementById("semesterSelect").value);
    let exists = semesters.some(sem => sem.semester === semester);

    if (exists) {
        alert("This semester is already calculated.");
        return;
    }

    let ignoreAU = document.getElementById("ignoreAU").checked;
    let totalCredits = 0;
    let totalPoints = 0;

    if (subjects.length === 0) {
        alert("Please add at least one subject.");
        return;
    }

    subjects.forEach(sub => {
        let gp = gradePoints[sub.grade];
        if (ignoreAU && sub.grade === "AU") return;
        totalCredits += sub.credit;
        totalPoints += sub.credit * gp;
    });

    let sgpa = totalPoints / totalCredits;

    semesters.push({
        semester: semester,
        sgpa: sgpa,
        credits: totalCredits
    });

    subjects = []; // Clear list after calculation
    renderSubjects();
    displayResults();
    saveData();
}

// Display Results in a Modern Table
function displayResults() {
    if (semesters.length === 0) {
        document.getElementById("results").innerHTML = "<p style='text-align:center; color:var(--text-muted);'>No results to show</p>";
        return;
    }

    semesters.sort((a, b) => a.semester - b.semester);

    let totalCredits = 0;
    let totalPoints = 0;

    let output = `
    <table>
        <thead>
            <tr>
                <th>Sem</th>
                <th>SGPA</th>
                <th>CGPA</th>
                <th>%</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
    `;

    semesters.forEach((sem, index) => {
        totalCredits += sem.credits;
        totalPoints += sem.sgpa * sem.credits;
        let cgpa = totalPoints / totalCredits;

        output += `
        <tr>
            <td>${sem.semester}</td>
            <td>${sem.sgpa.toFixed(2)}</td>
            <td>${cgpa.toFixed(2)}</td>
            <td>${(cgpa * 10).toFixed(2)}%</td>
            <td><button onclick="deleteSemester(${index})">Delete</button></td>
        </tr>
        `;
    });

    output += "</tbody></table>";
    document.getElementById("results").innerHTML = output;
}

function deleteSemester(index) {
    if (confirm("Delete this semester?")) {
        semesters.splice(index, 1);
        displayResults();
        saveData();
    }
}

function saveData() {
    localStorage.setItem("dbatuGradeMate", JSON.stringify(semesters));
}

function loadData() {
    let data = localStorage.getItem("dbatuGradeMate");
    if (data) semesters = JSON.parse(data);

    let savedType = localStorage.getItem("admissionType");
    if (savedType) admissionType = savedType;

    displayResults();
}

function clearAllData() {
    if (confirm("Are you sure you want to clear everything?")) {
        semesters = [];
        subjects = [];
        localStorage.removeItem("dbatuGradeMate");
        displayResults();
        renderSubjects();
    }
}

window.onload = loadData;