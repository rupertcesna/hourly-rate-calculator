const salaryInput=document.getElementById("salary");
const hoursInput=document.getElementById("hours");
const overtimeInput=document.getElementById("overtime");
const commuteInput=document.getElementById("commute");
const leaveInput=document.getElementById("leave");
const calcBtn=document.getElementById("calcBtn");
const resultDiv=document.getElementById("result");

function calculate() {
    const salary=Number(salaryInput.value);
    const hours=Number(hoursInput.value);
    const overtime=Number(overtimeInput.value);
    const commute=Number(commuteInput.value);
    const leave=Number(leaveInput.value);

    const workingWeeks=52 - (leave / 5);
    const weeklyHours=hours+overtime+(commute * 5 / 60);
    const totalHours=weeklyHours * workingWeeks;
    const realRate=salary / totalHours;

    resultDiv.textContent="Your real hourly rate: €"+realRate.toFixed(2);
}

if (salary <= 0 || hours <= 0) {
  resultDiv.textContent = "Enter your salary and weekly hours.";
  return;
}

calcBtn.addEventListener("click", calculate);
