const salaryInput=document.getElementById("salary");
const hoursInput=document.getElementById("hours");
const overtimeInput=document.getElementById("overtime");
const commuteInput=document.getElementById("commute");
const leaveInput=document.getElementById("leave");
const calcBtn=document.getElementById("calcBtn");
const resultDiv=document.getElementById("result");

function computeRate(salary, hours, overtime, commute, leave) {
    const workingWeeks = 52 - (leave / 5);
    const weeklyHours = hours + overtime + (commute * 5 / 60);
    const totalHours = weeklyHours * workingWeeks;
    return salary / totalHours;
}

function calculate() {
    const salary = Number(salaryInput.value);
    const hours = Number(hoursInput.value);
    const overtime = Number(overtimeInput.value);
    const commute = Number(commuteInput.value);
    const leave = Number(leaveInput.value);

    if (salary <= 0 || hours <= 0) {
        resultDiv.textContent = "Enter your salary and weekly hours.";
        return;
    }

    const realRate = computeRate(salary, hours, overtime, commute, leave);
    resultDiv.textContent = "Your real hourly rate: €" + realRate.toFixed(2);

    saveInputs();

}

calcBtn.addEventListener("click", calculate); 

function saveInputs() {
    const data = {
        salary: salaryInput.value,
        hours: hoursInput.value,
        overtime: overtimeInput.value,
        commute: commuteInput.value,
        leave: leaveInput.value
    };
    localStorage.setItem("rateInputs", JSON.stringify(data));
}

function loadInputs() {
    const saved = localStorage.getItem("rateInputs");
    if (!saved) return;

    const data = JSON.parse(saved);
    salaryInput.value = data.salary;
    hoursInput.value = data.hours;
    overtimeInput.value = data.overtime;
    commuteInput.value = data.commute;
    leaveInput.value = data.leave;
}

loadInputs();
