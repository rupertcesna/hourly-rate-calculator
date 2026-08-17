const SUPABASE_URL = "https://lgzfumbzntwrkkpigszu.supabase.co";
const SUPABASE_KEY = "sb_publishable_Tt0orymTSDgsKAqU6ykZ2g_l3QDYdZq";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const toggleOptional = document.getElementById("toggleOptional");
const optionalFields = document.getElementById("optionalFields");
const salaryInput = document.getElementById("salary");
const hoursInput = document.getElementById("hours");
const overtimeInput = document.getElementById("overtime");
const commuteInput = document.getElementById("commute");
const leaveInput = document.getElementById("leave");
const calcBtn = document.getElementById("calcBtn");
const resultDiv = document.getElementById("result");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("history");
const upgradeBtn = document.getElementById("upgradeBtn");
const waitlist = document.getElementById("waitlist");
const waitlistEmail = document.getElementById("waitlistEmail");
const waitlistBtn = document.getElementById("waitlistBtn");
const waitlistStatus = document.getElementById("waitlistStatus");
const breakdownDiv = document.getElementById("breakdown");
const comparisonDiv = document.getElementById("comparison");
const outputDiv = document.getElementById("output");
const savePrompt = document.getElementById("savePrompt");
const screenCalculator = document.getElementById("screenCalculator");
const screenAuth = document.getElementById("screenAuth");
const goToAuth = document.getElementById("goToAuth");
const backBtn = document.getElementById("backBtn");
const copyBtn = document.getElementById("copyBtn");
const upgradeSection = document.getElementById("upgrade");




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
        breakdownDiv.textContent = "";
        comparisonDiv.textContent = "";
        outputDiv.style.display = "block";
        return;
    }

    const realRate = computeRate(salary, hours, overtime, commute, leave);

    const workingWeeks = 52 - (leave / 5);
    const weeklyHours = hours + overtime + (commute * 5 / 60);
    const totalHours = weeklyHours * workingWeeks;
    const assumedRate = salary / (hours * 52);
    const difference = ((assumedRate - realRate) / assumedRate) * 100;

    resultDiv.textContent = "€" + realRate.toFixed(2) + " per hour";

    breakdownDiv.textContent =
        weeklyHours.toFixed(1) + " real hours per week × " +
        workingWeeks + " working weeks = " +
        Math.round(totalHours).toLocaleString() + " hours. " +
        "€" + salary.toLocaleString() + " ÷ " + Math.round(totalHours).toLocaleString() + " hours.";

    comparisonDiv.textContent =
        "You probably thought it was €" + assumedRate.toFixed(2) +
        ". That's " + difference.toFixed(0) + "% higher than reality.";

    outputDiv.style.display = "block";

    saveInputs();
    updateURL(salary, hours, overtime, commute, leave);
    saveToDatabase(salary, hours, overtime, commute, leave, realRate);
}

function toggleOptionalFields() {
    const isHidden = optionalFields.style.display === "none";
    optionalFields.style.display = isHidden ? "block" : "none";
    toggleOptional.textContent = isHidden
        ? "− Hide overtime, commute and holidays"
        : "+ Add overtime, commute and holidays";
}

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

    if (!sessionData.session) {
        return;
    }

    const userId = sessionData.session.user.id;

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
    loadHistory();
}

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
    historyList.innerHTML = "";
    historySection.style.display = "none";
}

async function loadHistory() {
    const { data, error } = await db
        .from("calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) {
        console.log("History failed:", error.message);
        return;
    }

    historyList.innerHTML = "";

    data.forEach(function (row) {
        const li = document.createElement("li");
        li.textContent = "€" + row.rate.toFixed(2) + " — " + row.salary + "€ / " + row.hours + "h";
        historyList.appendChild(li);
    });
}

async function checkSession() {
    const { data } = await db.auth.getSession();

    if (data.session) {
        authStatus.textContent = "Logged in as " + data.session.user.email;
        historySection.style.display = "block";
        savePrompt.style.display = "none";
        loadHistory();
    } else {
        authStatus.textContent = "Not logged in";
        historySection.style.display = "none";
        savePrompt.style.display = "block";
    }
}

function showWaitlist() {
    waitlist.style.display = "block";
    upgradeBtn.style.display = "none";
}

function showScreen(name) {
    screenCalculator.style.display = name === "calculator" ? "block" : "none";
    screenAuth.style.display = name === "auth" ? "block" : "none";
    window.scrollTo(0, 0);
}

async function joinWaitlist() {
    const email = waitlistEmail.value.trim();

    if (!email.includes("@")) {
        waitlistStatus.textContent = "Enter a valid email.";
        return;
    }

    const { error } = await db
        .from("waitlist")
        .insert({ email: email, source: "pro-upgrade" });

    if (error) {
        waitlistStatus.textContent = "Something went wrong.";
        console.log(error.message);
        return;
    }

    async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    copyBtn.textContent = "Copied";
    setTimeout(function () {
        copyBtn.textContent = "Copy link to this result";
    }, 2000);
}

    waitlistStatus.textContent = "Thanks — you'll hear from me.";
    waitlistEmail.value = "";
}

calcBtn.addEventListener("click", calculate);
signupBtn.addEventListener("click", signUp);
loginBtn.addEventListener("click", logIn);
logoutBtn.addEventListener("click", logOut);
upgradeBtn.addEventListener("click", showWaitlist);
waitlistBtn.addEventListener("click", joinWaitlist);
toggleOptional.addEventListener("click", toggleOptionalFields);
goToAuth.addEventListener("click", function () { showScreen("auth"); });
backBtn.addEventListener("click", function () { showScreen("calculator"); });
copyBtn.addEventListener("click", copyLink);

if (loadFromURL()) {
    calculate();
} else {
    loadInputs();
}
checkSession();
