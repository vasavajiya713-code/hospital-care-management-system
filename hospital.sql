-- CityCare Hospital database design for the college project.
-- The live GitHub Pages demo uses Local Storage because GitHub Pages
-- cannot run PHP/MySQL. This schema is ready for backend integration.

CREATE DATABASE citycare_hospital;
USE citycare_hospital;

CREATE TABLE departments (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE doctors (
  doctor_id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_name VARCHAR(120) NOT NULL,
  department_id INT NOT NULL,
  qualification VARCHAR(150),
  experience_years INT,
  consultation_timings VARCHAR(100),
  availability_status VARCHAR(30) DEFAULT 'Available',
  FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(120) NOT NULL,
  age INT,
  gender VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(150)
);

CREATE TABLE appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  department_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(30) NOT NULL,
  reason TEXT,
  booking_status VARCHAR(30) DEFAULT 'Confirmed',
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
  FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE feedback (
  feedback_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(120),
  rating INT,
  review TEXT,
  suggestion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (department_name, description) VALUES
('Cardiology','Heart and circulation care'),
('Neurology','Brain and nervous system care'),
('Orthopedics','Bones, joints and movement'),
('Pediatrics','Healthcare for children'),
('Dermatology','Skin, hair and nail care'),
('General Medicine','Primary and routine medical care');
