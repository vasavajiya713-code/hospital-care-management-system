document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (menuToggle && nav) menuToggle.addEventListener("click", () => nav.classList.toggle("open"));

  // Demo login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const status = document.getElementById("loginStatus");
    const remember = document.getElementById("remember");
    const saved = localStorage.getItem("citycareRememberedEmail");
    if (saved) { email.value = saved; remember.checked = true; }

    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      document.getElementById("emailError").textContent = "";
      document.getElementById("passwordError").textContent = "";
      status.textContent = "";
      let ok = true;
      if (!email.value.trim() || !email.validity.valid) { document.getElementById("emailError").textContent = "Please enter a valid email address."; ok = false; }
      if (!password.value) { document.getElementById("passwordError").textContent = "Please enter your password."; ok = false; }
      if (!ok) return;
      if (email.value.trim().toLowerCase() === "patient@citycare.com" && password.value === "patient123") {
        if (remember.checked) localStorage.setItem("citycareRememberedEmail", email.value.trim());
        else localStorage.removeItem("citycareRememberedEmail");
        status.className = "login-status success";
        status.textContent = "Login successful. Opening your portal…";
        setTimeout(() => window.location.href = "home.html", 500);
      } else {
        status.className = "login-status error";
        status.textContent = "Demo login details are incorrect.";
      }
    });

    const toggle = document.getElementById("togglePassword");
    if (toggle) toggle.addEventListener("click", () => {
      const visible = password.type === "text";
      password.type = visible ? "password" : "text";
      toggle.textContent = visible ? "Show" : "Hide";
      toggle.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    });
    const forgot = document.getElementById("forgotLink");
    if (forgot) forgot.addEventListener("click", e => { e.preventDefault(); alert("For this college demo, use patient@citycare.com / patient123."); });
  }

  // Doctor filtering
  const doctorSearch = document.getElementById("doctorSearch");
  const doctorFilter = document.getElementById("doctorFilter");
  const doctorCards = [...document.querySelectorAll(".doctor")];
  const doctorEmpty = document.getElementById("doctorEmpty");
  function filterDoctors() {
    if (!doctorCards.length) return;
    const q = (doctorSearch?.value || "").toLowerCase();
    const dep = doctorFilter?.value || "all";
    let shown = 0;
    doctorCards.forEach(card => {
      const match = card.dataset.name.toLowerCase().includes(q) && (dep === "all" || card.dataset.department === dep);
      card.style.display = match ? "" : "none";
      if (match) shown++;
    });
    if (doctorEmpty) doctorEmpty.style.display = shown ? "none" : "block";
  }
  doctorSearch?.addEventListener("input", filterDoctors);
  doctorFilter?.addEventListener("change", filterDoctors);

  // Appointment form
  const appointmentForm = document.getElementById("appointmentForm");
  if (appointmentForm) {
    const params = new URLSearchParams(location.search);
    const dep = params.get("department");
    const doc = params.get("doctor");
    if (dep) document.getElementById("department").value = dep;
    if (doc) document.getElementById("doctor").value = doc;
    const date = document.getElementById("date");
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    date.min = localDate;
    if (!date.value) date.value = localDate;

    appointmentForm.addEventListener("submit", e => {
      e.preventDefault();
      const status = document.getElementById("appointmentStatus");
      if (!appointmentForm.checkValidity()) {
        appointmentForm.reportValidity();
        status.className = "form-status error";
        status.textContent = "Please complete all required fields.";
        return;
      }
      const appointment = {
        id: "CC-" + Date.now().toString().slice(-6),
        patientName: document.getElementById("patientName").value.trim(),
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value,
        phone: document.getElementById("phone").value.trim(),
        department: document.getElementById("department").value,
        doctor: document.getElementById("doctor").value,
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        reason: document.getElementById("reason").value.trim(),
        createdAt: new Date().toISOString()
      };
      const appointments = JSON.parse(localStorage.getItem("citycareAppointments") || "[]");
      appointments.push(appointment);
      localStorage.setItem("citycareAppointments", JSON.stringify(appointments));
      status.className = "form-status success";
      status.textContent = `Appointment ${appointment.id} confirmed for ${appointment.patientName}.`;
      appointmentForm.reset();
      date.value = localDate;
      if (dep) document.getElementById("department").value = dep;
      if (doc) document.getElementById("doctor").value = doc;
    });

    document.getElementById("department")?.addEventListener("change", function() {
      const selected = this.value;
      const doctor = document.getElementById("doctor");
      [...doctor.options].forEach((option, i) => {
        if (i === 0) { option.hidden = false; return; }
        option.hidden = option.dataset.dept !== selected;
      });
      doctor.value = "";
    });
  }

  // Contact form
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
      const messages = JSON.parse(localStorage.getItem("citycareMessages") || "[]");
      messages.push({
        name: document.getElementById("contactName").value.trim(),
        email: document.getElementById("contactEmail").value.trim(),
        subject: document.getElementById("contactSubject").value.trim(),
        message: document.getElementById("contactMessage").value.trim(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("citycareMessages", JSON.stringify(messages));
      const status = document.getElementById("contactStatus");
      status.className = "form-status success";
      status.textContent = "Message sent successfully for this demo.";
      contactForm.reset();
    });
  }
});
