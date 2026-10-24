# CityCare Hospital - Hospital Care Management System

College minor project demo built with HTML5, CSS3 and JavaScript.

## Run locally
Open `index.html` in a browser, or use VS Code Live Server.

## Demo login
Email: `patient@citycare.com`
Password: `patient123`

## Features
- Login page with validation, show/hide password and "remember me"
- Pages are protected - you need to sign in first (the Contact page is open to everyone)
- Home page
- About Us
- Doctors with search and department filter
- Departments (links to booking with the department already selected)
- Appointment booking
  - doctor list changes with the selected department
  - time slots follow the doctor's consultation timings and working days
  - past dates and already booked slots are blocked
  - booking reference number and a list of your bookings with a cancel option
- Contact form
- Feedback form
- Local Storage saving for appointments, messages and feedback
- MySQL database design (`hospital.sql`)

## Project structure
```
index.html          login page
home.html           home page
about.html          about us
doctors.html        doctors list
departments.html    departments
appointment.html    appointment booking
contact.html        contact + feedback
css/style.css       styling
js/script.js        all JavaScript
hospital.sql        database design
```

## Local Storage keys
`citycareUser`, `citycareAppointments`, `citycareMessages`, `citycareFeedback`

## GitHub Pages
This project is designed for static hosting. The `.nojekyll` file prevents GitHub Pages from trying to process the site with Jekyll.

## Future work
Connect the forms to PHP + MySQL using `hospital.sql`, add patient registration and an admin panel.
