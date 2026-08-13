const SUPABASE_URL = "https://lgzfumbzntwrkkpigszu.supabase.co";
const SUPABASE_KEY = "sb_publishable_Tt0orymTSDgsKAqU6ykZ2g_l3QDYdZq";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const salaryInput=document.getElementById("salary");
const hoursInput=document.getElementById("hours");
const overtimeInput=document.getElementById("overtime");
const commuteInput=document.getElementById("commute");
const leaveInput=document.getElementById("leave");
const calcBtn=document.getElementById("calcBtn");
const resultDiv=document.getElementById("result");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");

signupBtn.addEventListener("click", signUp);
loginBtn.addEventListener("click", logIn);
logoutBtn.addEventListener("click", logOut);


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
    updateURL(salary, hours, overtime, commute, leave);

    saveToDatabase(salary, hours, overtime, commute, leave, realRate);


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


function updateURL(salary, hours, overtime, commute, leave) {
    const params = new URLSearchParams({
        salary: salary,
        hours: hours,
        overtime: overtime,
        commute: commute,
        leave: leave
    });
    history.replaceState(null, "", "?" + params.toString());
}

function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("salary")) return false;

    salaryInput.value = params.get("salary");
    hoursInput.value = params.get("hours");
    overtimeInput.value = params.get("overtime");
    commuteInput.value = params.get("commute");
    leaveInput.value = params.get("leave");
    return true;
}

async function saveToDatabase(salary, hours, overtime, commute, leave, rate) {
    const { data: sessionData } = await db.auth.getSession();
    const userId = sessionData.session ? sessionData.session.user.id : null;

    const { error } = await db
        .from("calculations")
        .insert({
            user_id: userId,
            salary: salary,
            hours: hours,
            overtime: overtime,
            commute: commute,
            leave: leave,
            rate: rate
        });

    if (error) {
        console.log("Save failed:", error.message);
        return;
    }

    console.log("Saved to database");
}

if (loadFromURL()) {
    calculate();
} else {
    loadInputs();
}

checkSession();


async function signUp() {
    const { data, error } = await db.auth.signUp({
        email: emailInput.value,
        password: passwordInput.value
    });

    if (error) {
        authStatus.textContent = error.message;
        return;
    }

    authStatus.textContent = "Signed up as " + data.user.email;
}

async function logIn() {
    const { data, error } = await db.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value
    });

    if (error) {
        authStatus.textContent = error.message;
        return;
    }

    authStatus.textContent = "Logged in as " + data.user.email;
}

async function logOut() {
    await db.auth.signOut();
    authStatus.textContent = "Logged out";
}

async function checkSession() {
    const { data } = await db.auth.getSession();

    if (data.session) {
        authStatus.textContent = "Logged in as " + data.session.user.email;
    } else {
        authStatus.textContent = "Not logged in";
    }
}



