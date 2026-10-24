// CityCare Hospital - main script
// Data is saved in the browser (Local Storage) because GitHub Pages cannot run PHP/MySQL.

var DEMO_EMAIL = "patient@citycare.com";
var DEMO_PASSWORD = "patient123";

// ---------- small helper functions ----------

function getData(key) {
  try {
    var data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function saveData(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
}

function isLoggedIn() {
  return localStorage.getItem("citycareUser") || sessionStorage.getItem("citycareUser");
}

function logout() {
  localStorage.removeItem("citycareUser");
  sessionStorage.removeItem("citycareUser");
}

function showMessage(box, text, type) {
  box.textContent = text;
  box.classList.remove("success", "error");
  if (text !== "") {
    box.classList.add(type);
  }
}

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}

// today's date as yyyy-mm-dd (local time)
function getTodayString() {
  var d = new Date();
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

// convert yyyy-mm-dd to a Date object (local time)
function parseDate(str) {
  var parts = str.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function formatDate(str) {
  return parseDate(str).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function startPage() {
  setupNavbar();
  setupLogin();
  setupDoctors();
  setupAppointment();
  setupContact();
  setupFeedback();
}

// ---------- navbar ----------

function setupNavbar() {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  var navLogin = document.querySelector(".nav-login");
  if (navLogin) {
    if (!isLoggedIn()) {
      navLogin.textContent = "Sign in";
    }
    navLogin.addEventListener("click", function () {
      logout();
    });
  }
}

// ---------- login page ----------

function setupLogin() {
  var form = document.getElementById("loginForm");
  if (!form) return;

  var emailInput = document.getElementById("email");
  var passwordInput = document.getElementById("password");
  var remember = document.getElementById("remember");
  var emailError = document.getElementById("emailError");
  var passwordError = document.getElementById("passwordError");
  var status = document.getElementById("loginStatus");
  var toggleBtn = document.getElementById("togglePassword");
  var forgot = document.getElementById("forgotLink");

  // fill the email if the user chose "remember me" earlier
  var savedEmail = localStorage.getItem("citycareRememberedEmail");
  if (savedEmail) {
    emailInput.value = savedEmail;
    remember.checked = true;
  }

  toggleBtn.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleBtn.textContent = "Hide";
      toggleBtn.setAttribute("aria-label", "Hide password");
    } else {
      passwordInput.type = "password";
      toggleBtn.textContent = "Show";
      toggleBtn.setAttribute("aria-label", "Show password");
    }
  });

  forgot.addEventListener("click", function (e) {
    e.preventDefault();
    showMessage(status, "Password reset is not available in this demo. Please contact CityCare for help.", "error");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    emailError.textContent = "";
    passwordError.textContent = "";
    showMessage(status, "", "");

    var email = emailInput.value.trim().toLowerCase();
    var password = passwordInput.value;
    var ok = true;

    if (email === "") {
      emailError.textContent = "Please enter your email address.";
      ok = false;
    } else if (!isValidEmail(email)) {
      emailError.textContent = "Please enter a valid email address.";
      ok = false;
    }

    if (password === "") {
      passwordError.textContent = "Please enter your password.";
      ok = false;
    } else if (password.length < 6) {
      passwordError.textContent = "Password must be at least 6 characters.";
      ok = false;
    }

    if (!ok) return;

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      logout();
      if (remember.checked) {
        localStorage.setItem("citycareUser", email);
        localStorage.setItem("citycareRememberedEmail", email);
      } else {
        sessionStorage.setItem("citycareUser", email);
        localStorage.removeItem("citycareRememberedEmail");
      }
      showMessage(status, "Login successful. Redirecting...", "success");
      setTimeout(function () {
        window.location.href = "home.html";
      }, 800);
    } else {
      showMessage(status, "Incorrect email or password. Please try again.", "error");
    }
  });
}

// ---------- doctors page (search + filter) ----------

function setupDoctors() {
  var search = document.getElementById("doctorSearch");
  var filter = document.getElementById("doctorFilter");
  var empty = document.getElementById("doctorEmpty");
  var cards = document.querySelectorAll(".doctor");
  if (!search || !filter) return;

  function filterDoctors() {
    var text = search.value.trim().toLowerCase().replace(/^dr\.?\s*/, "");
    var dept = filter.value;
    var shown = 0;

    for (var i = 0; i < cards.length; i++) {
      var name = cards[i].getAttribute("data-name").toLowerCase();
      var cardDept = cards[i].getAttribute("data-department");
      var matchText = name.indexOf(text) !== -1 || cardDept.toLowerCase().indexOf(text) !== -1;
      var matchDept = dept === "all" || dept === cardDept;

      if (matchText && matchDept) {
        cards[i].classList.remove("hidden");
        shown++;
      } else {
        cards[i].classList.add("hidden");
      }
    }

    if (shown === 0) {
      empty.classList.add("show");
    } else {
      empty.classList.remove("show");
    }
  }

  search.addEventListener("input", filterDoctors);
  filter.addEventListener("change", filterDoctors);
}

// ---------- appointment page ----------

// working days (0 = Sunday) and consultation hours of each doctor (same as the doctors page)
var doctorInfo = {
  "Dr. Aarav Mehta": { days: [1, 2, 3, 4, 5], from: 10, to: 14 },
  "Dr. Meera Kapoor": { days: [1, 2, 3, 4, 5, 6], from: 11, to: 15 },
  "Dr. Rohan Shah": { days: [2, 3, 4, 5, 6], from: 9, to: 13 },
  "Dr. Ishita Rao": { days: [1, 2, 3, 4, 5], from: 16, to: 19 },
  "Dr. Nisha Patel": { days: [1, 2, 3, 4, 5, 6], from: 10, to: 13 },
  "Dr. Kabir Joshi": { days: [1, 2, 3, 4, 5, 6], from: 8.5, to: 12.5 }
};

var timeSlots = [
  { label: "09:00 AM", hour: 9 },
  { label: "10:00 AM", hour: 10 },
  { label: "11:00 AM", hour: 11 },
  { label: "12:00 PM", hour: 12 },
  { label: "01:00 PM", hour: 13 },
  { label: "04:00 PM", hour: 16 },
  { label: "05:00 PM", hour: 17 },
  { label: "06:00 PM", hour: 18 }
];

var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function setupAppointment() {
  var form = document.getElementById("appointmentForm");
  if (!form) return;

  var nameInput = document.getElementById("patientName");
  var ageInput = document.getElementById("age");
  var genderInput = document.getElementById("gender");
  var phoneInput = document.getElementById("phone");
  var deptInput = document.getElementById("department");
  var doctorInput = document.getElementById("doctor");
  var dateInput = document.getElementById("date");
  var timeInput = document.getElementById("time");
  var reasonInput = document.getElementById("reason");
  var consent = document.getElementById("consent");
  var status = document.getElementById("appointmentStatus");
  var list = document.getElementById("appointmentList");

  // remember the full doctor list from the HTML
  var allDoctors = [];
  for (var i = 0; i < doctorInput.options.length; i++) {
    if (doctorInput.options[i].value !== "") {
      allDoctors.push({
        name: doctorInput.options[i].text,
        dept: doctorInput.options[i].getAttribute("data-dept")
      });
    }
  }

  dateInput.min = getTodayString();

  // show only the doctors of the chosen department
  function fillDoctors(dept, selected) {
    doctorInput.innerHTML = "";
    var first = document.createElement("option");
    first.value = "";
    first.textContent = "Select doctor";
    doctorInput.appendChild(first);

    for (var i = 0; i < allDoctors.length; i++) {
      if (dept === "" || allDoctors[i].dept === dept) {
        var opt = document.createElement("option");
        opt.value = allDoctors[i].name;
        opt.textContent = allDoctors[i].name;
        doctorInput.appendChild(opt);
      }
    }
    doctorInput.value = selected || "";
  }

  function getDoctorDept(name) {
    for (var i = 0; i < allDoctors.length; i++) {
      if (allDoctors[i].name === name) return allDoctors[i].dept;
    }
    return "";
  }

  // is this slot already booked for the doctor on that date?
  function isBooked(doctor, date, time) {
    var saved = getData("citycareAppointments");
    for (var i = 0; i < saved.length; i++) {
      if (saved[i].doctor === doctor && saved[i].date === date && saved[i].time === time && saved[i].status !== "Cancelled") {
        return true;
      }
    }
    return false;
  }

  // check if the doctor works on the selected date, returns an error text or ""
  function checkDay(doctor, date) {
    if (!doctor || !date) return "";
    var info = doctorInfo[doctor];
    var day = parseDate(date).getDay();
    if (info && info.days.indexOf(day) === -1) {
      return doctor + " is not available on " + dayNames[day] + "s. Please choose another date.";
    }
    return "";
  }

  // fill the time list using the doctor's timings
  function fillTimes() {
    var previous = timeInput.value;
    var doctor = doctorInput.value;
    var date = dateInput.value;
    var info = doctorInfo[doctor];
    var dayProblem = checkDay(doctor, date);
    var now = new Date();

    timeInput.innerHTML = "";
    var first = document.createElement("option");
    first.value = "";
    first.textContent = "Select time";
    timeInput.appendChild(first);

    if (dayProblem !== "") return;

    for (var i = 0; i < timeSlots.length; i++) {
      var slot = timeSlots[i];
      if (info && (slot.hour < info.from || slot.hour >= info.to)) continue;
      if (date === getTodayString() && slot.hour <= now.getHours()) continue;
      if (doctor && date && isBooked(doctor, date, slot.label)) continue;

      var opt = document.createElement("option");
      opt.value = slot.label;
      opt.textContent = slot.label;
      timeInput.appendChild(opt);
    }
    timeInput.value = previous;
  }

  function refreshSlots() {
    var problem = checkDay(doctorInput.value, dateInput.value);
    if (problem !== "") {
      showMessage(status, problem, "error");
    } else {
      showMessage(status, "", "");
    }
    fillTimes();
  }

  // read department / doctor from the link (example: appointment.html?department=Cardiology)
  var params = new URLSearchParams(window.location.search);
  var urlDept = params.get("department");
  var urlDoctor = params.get("doctor");

  if (urlDoctor && getDoctorDept(urlDoctor) !== "") {
    deptInput.value = getDoctorDept(urlDoctor);
    fillDoctors(deptInput.value, urlDoctor);
  } else if (urlDept) {
    deptInput.value = urlDept;
    if (deptInput.value !== urlDept) deptInput.value = "";
    fillDoctors(deptInput.value, "");
  }
  fillTimes();

  deptInput.addEventListener("change", function () {
    fillDoctors(deptInput.value, doctorInput.value);
    refreshSlots();
  });

  doctorInput.addEventListener("change", function () {
    if (doctorInput.value !== "") {
      var d = getDoctorDept(doctorInput.value);
      if (deptInput.value !== d) {
        deptInput.value = d;
        fillDoctors(d, doctorInput.value);
      }
    }
    refreshSlots();
  });

  dateInput.addEventListener("change", refreshSlots);

  // ----- submit -----
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = nameInput.value.trim();
    var age = Number(ageInput.value);
    var phone = phoneInput.value.trim();
    var date = dateInput.value;
    var doctor = doctorInput.value;
    var time = timeInput.value;
    var error = "";

    if (name.length < 3 || !/^[A-Za-z .'-]+$/.test(name)) {
      error = "Please enter the patient's full name (letters only).";
    } else if (ageInput.value === "" || !Number.isInteger(age) || age < 1 || age > 120) {
      error = "Please enter a valid age between 1 and 120.";
    } else if (genderInput.value === "") {
      error = "Please select the gender.";
    } else if (!/^\d{10}$/.test(phone)) {
      error = "Contact number must be exactly 10 digits.";
    } else if (deptInput.value === "") {
      error = "Please select a department.";
    } else if (doctor === "") {
      error = "Please select a doctor.";
    } else if (getDoctorDept(doctor) !== deptInput.value) {
      error = "The selected doctor does not belong to this department.";
    } else if (date === "") {
      error = "Please select the appointment date.";
    } else if (date < getTodayString()) {
      error = "Appointment date cannot be in the past.";
    } else if (checkDay(doctor, date) !== "") {
      error = checkDay(doctor, date);
    } else if (time === "") {
      error = "Please select an appointment time.";
    } else if (isBooked(doctor, date, time)) {
      error = "This time slot is already booked. Please choose another one.";
    } else if (!consent.checked) {
      error = "Please confirm that the information provided is correct.";
    }

    if (error !== "") {
      showMessage(status, error, "error");
      return;
    }

    var appointments = getData("citycareAppointments");
    var ref = "CC" + Date.now().toString().slice(-6);

    appointments.push({
      ref: ref,
      patientName: name,
      age: age,
      gender: genderInput.value,
      phone: phone,
      department: deptInput.value,
      doctor: doctor,
      date: date,
      time: time,
      reason: reasonInput.value.trim(),
      status: "Confirmed",
      bookedOn: new Date().toLocaleString("en-IN")
    });

    if (!saveData("citycareAppointments", appointments)) {
      showMessage(status, "Could not save the appointment. Please check your browser storage settings.", "error");
      return;
    }

    form.reset();
    fillDoctors("", "");
    fillTimes();
    showMessage(status, "Appointment confirmed! Your booking reference is " + ref + " (" + doctor + ", " + formatDate(date) + " at " + time + ").", "success");
    showAppointments();
  });

  // ----- list of saved appointments -----
  function showAppointments() {
    if (!list) return;
    var appointments = getData("citycareAppointments");

    if (appointments.length === 0) {
      list.innerHTML = '<div class="appt-empty">No appointments booked yet.</div>';
      return;
    }

    var html = "";
    // newest first
    for (var i = appointments.length - 1; i >= 0; i--) {
      var a = appointments[i];
      var cancelled = a.status === "Cancelled";
      html += '<div class="appt-card">';
      html += '<span class="appt-ref">' + escapeHtml(a.ref) + "</span>";
      html += "<h3>" + escapeHtml(a.doctor) + "</h3>";
      html += "<p>" + escapeHtml(a.department) + "</p>";
      html += "<p>" + escapeHtml(formatDate(a.date)) + " at " + escapeHtml(a.time) + "</p>";
      html += "<p>Patient: " + escapeHtml(a.patientName) + "</p>";
      html += '<span class="appt-status' + (cancelled ? " cancelled" : "") + '">' + escapeHtml(a.status) + "</span>";
      if (!cancelled) {
        html += '<br><button type="button" class="btn-cancel" data-ref="' + escapeHtml(a.ref) + '">Cancel appointment</button>';
      }
      html += "</div>";
    }
    list.innerHTML = html;
  }

  if (list) {
    list.addEventListener("click", function (e) {
      var ref = e.target.getAttribute("data-ref");
      if (!ref) return;
      if (!confirm("Do you want to cancel appointment " + ref + "?")) return;

      var appointments = getData("citycareAppointments");
      for (var i = 0; i < appointments.length; i++) {
        if (appointments[i].ref === ref) {
          appointments[i].status = "Cancelled";
        }
      }
      saveData("citycareAppointments", appointments);
      showAppointments();
      fillTimes();
    });
  }

  showAppointments();
}

// ---------- contact page ----------

function setupContact() {
  var form = document.getElementById("contactForm");
  if (!form) return;

  var status = document.getElementById("contactStatus");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = document.getElementById("contactName").value.trim();
    var email = document.getElementById("contactEmail").value.trim();
    var subject = document.getElementById("contactSubject").value.trim();
    var message = document.getElementById("contactMessage").value.trim();

    if (name.length < 2) {
      showMessage(status, "Please enter your name.", "error");
    } else if (!isValidEmail(email)) {
      showMessage(status, "Please enter a valid email address.", "error");
    } else if (subject === "") {
      showMessage(status, "Please enter a subject.", "error");
    } else if (message.length < 10) {
      showMessage(status, "Your message should be at least 10 characters long.", "error");
    } else {
      var messages = getData("citycareMessages");
      messages.push({ name: name, email: email, subject: subject, message: message, sentOn: new Date().toLocaleString("en-IN") });

      if (saveData("citycareMessages", messages)) {
        form.reset();
        showMessage(status, "Thank you, " + name + ". Your message has been sent. We will get back to you soon.", "success");
      } else {
        showMessage(status, "Could not save your message. Please check your browser storage settings.", "error");
      }
    }
  });
}

// ---------- feedback form (contact page) ----------

function setupFeedback() {
  var form = document.getElementById("feedbackForm");
  if (!form) return;

  var status = document.getElementById("feedbackStatus");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = document.getElementById("fbName").value.trim();
    var rating = document.getElementById("fbRating").value;
    var review = document.getElementById("fbReview").value.trim();
    var suggestion = document.getElementById("fbSuggestion").value.trim();

    if (name.length < 2) {
      showMessage(status, "Please enter your name.", "error");
    } else if (rating === "") {
      showMessage(status, "Please select a rating.", "error");
    } else if (review.length < 5) {
      showMessage(status, "Please write a short review.", "error");
    } else {
      var feedback = getData("citycareFeedback");
      feedback.push({ name: name, rating: Number(rating), review: review, suggestion: suggestion, createdAt: new Date().toLocaleString("en-IN") });

      if (saveData("citycareFeedback", feedback)) {
        form.reset();
        showMessage(status, "Thank you for your feedback!", "success");
      } else {
        showMessage(status, "Could not save your feedback. Please check your browser storage settings.", "error");
      }
    }
  });
}

// ---------- login check for pages ----------

var currentPage = location.pathname.split("/").pop() || "index.html";
var onLoginPage = document.body.classList.contains("auth-page");

if (onLoginPage && isLoggedIn()) {
  // already signed in, no need to see the login page
  window.location.href = "home.html";
} else if (!onLoginPage && currentPage !== "contact.html" && !isLoggedIn()) {
  // contact page is open to everyone, other pages need login
  window.location.href = "index.html";
} else {
  startPage();
}
