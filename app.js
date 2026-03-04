let subjects = [];
let semesters = [];
let admissionType = null;

// Grade to grade point mapping

const gradePoints = {
EX:10,
AA:9,
AB:8.5,
BB:8,
BC:7.5,
CC:7,
CD:6.5,
DD:6,
DE:5.5,
EE:5,
FF:0,
AU:0
};



// Start the app when "Start" button is clicked

function startApp(){

const admission=document.querySelector('input[name="admission"]:checked');

if(!admission){
alert("Select admission type");
return;
}

let selectedType = admission.value;

// check if admission type changed
if(admissionType && admissionType !== selectedType){

let confirmReset = confirm("Changing admission type will reset all saved data. Continue?");

if(!confirmReset){
return;
}

semesters=[];
subjects=[];
localStorage.removeItem("dbatuGradeMate");

document.getElementById("results").innerHTML="";
}

admissionType = selectedType;

localStorage.setItem("admissionType", admissionType);

let sems=[];

if(admissionType==="regular"){
sems=[1,2,3,4,5,6,7,8];
}else{
sems=[3,4,5,6,7,8];
}

const select=document.getElementById("semesterSelect");

select.innerHTML="";

sems.forEach(s=>{
let option=document.createElement("option");
option.value=s;
option.text="Semester "+s;
select.appendChild(option);
});

document.getElementById("mainApp").style.display="block";

}

// Toggle dark mode

function toggleDarkMode(){

document.body.classList.toggle("dark");

}

// Add subject when "Add Subject" button is clicked

function addSubject(){

const credit=parseFloat(document.getElementById("credit").value);
const grade=document.getElementById("grade").value;

if(!credit || !grade){
alert("Enter credit and grade");
return;
}

subjects.push({credit,grade});

renderSubjects();

document.getElementById("credit").value="";
document.getElementById("grade").value="";

}

// Render the list of subjects

function renderSubjects(){

const list=document.getElementById("subjectList");

list.innerHTML="";

subjects.forEach((sub,index)=>{

let li=document.createElement("li");

li.innerHTML=
`Credit ${sub.credit} | Grade ${sub.grade} 
<button onclick="deleteSubject(${index})">Delete</button>`;

list.appendChild(li);

});

}

// Save data to localStorage

function saveData(){

localStorage.setItem("dbatuGradeMate", JSON.stringify(semesters));

}

// Load data from localStorage

function loadData(){

let data = localStorage.getItem("dbatuGradeMate");

if(data){
semesters = JSON.parse(data);
}

let savedType = localStorage.getItem("admissionType");

if(savedType){
admissionType = savedType;
}

displayResults();

}

// Delete a subject from the list

function deleteSubject(index){

let confirmDelete = confirm("Are you sure you want to delete this subject?");

if(!confirmDelete){
return;
}

subjects.splice(index,1);

renderSubjects();

}

// Delete a semester from the results

function deleteSemester(index){

let confirmDelete = confirm("Are you sure you want to delete this semester?");

if(!confirmDelete){
return;
}

semesters.splice(index,1);

displayResults();
saveData();

}

// Calculate semester GPA

function calculateSemester(){

let semester = parseInt(document.getElementById("semesterSelect").value);

// 🔍 check if semester already exists
let exists = semesters.some(sem => sem.semester === semester);

if(exists){
alert("This semester is already calculated. You cannot add it again.");
return;
}

let ignoreAU = document.getElementById("ignoreAU").checked;

let totalCredits=0;
let totalPoints=0;

subjects.forEach(sub=>{

let gp = gradePoints[sub.grade];

// AU handling
if(ignoreAU && sub.grade === "AU"){
return;
}

totalCredits += sub.credit;
totalPoints += sub.credit * gp;

});

if(totalCredits === 0){
alert("No valid subjects to calculate SGPA.");
return;
}

let sgpa = totalPoints / totalCredits;

semesters.push({
semester:semester,
sgpa:sgpa,
credits:totalCredits
});

subjects=[];
document.getElementById("subjectList").innerHTML="";

displayResults();
saveData();

}

// Clear all saved data

function clearAllData(){

let confirmClear = confirm("This will delete all saved semesters. Continue?");

if(!confirmClear){
return;
}

semesters=[];
subjects=[];

localStorage.removeItem("dbatuGradeMate");

document.getElementById("results").innerHTML="";
document.getElementById("subjectList").innerHTML="";

}

// Display the results for all semesters

function displayResults(){

semesters.sort((a,b)=>a.semester - b.semester);

let totalCredits=0;
let totalPoints=0;

let output = `
<table border="1" cellpadding="8">
<tr>
<th>Semester</th>
<th>SGPA</th>
<th>CGPA</th>
<th>Percentage</th>
<th>Action</th>
</tr>
`;

semesters.forEach((sem,index)=>{

totalCredits+=sem.credits;
totalPoints+=sem.sgpa*sem.credits;

let cgpa=totalPoints/totalCredits;

output+=`
<tr>
<td>${sem.semester}</td>
<td>${sem.sgpa.toFixed(2)}</td>
<td>${cgpa.toFixed(2)}</td>
<td>${(cgpa*10).toFixed(2)}%</td>
<td><button onclick="deleteSemester(${index})">Delete</button></td>
</tr>
`;

});

document.getElementById("results").innerHTML=output;
output += "</table>";
}

window.onload = loadData;