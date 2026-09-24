-- =====================================================
-- Fee Management System (FMS) — PostgreSQL Schema
-- Version: 1.0
-- =====================================================

-- Create database manually if needed in PostgreSQL:
-- CREATE DATABASE fee_management_db;

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'accountant', 'student')),
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_structures (
  fee_structure_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  course VARCHAR(50) NOT NULL,
  semester_year VARCHAR(10) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS fee_heads (
  fee_head_id SERIAL PRIMARY KEY,
  fee_structure_id INT NOT NULL,
  head_name VARCHAR(50) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  CONSTRAINT fk_fee_heads_structure FOREIGN KEY (fee_structure_id)
    REFERENCES fee_structures(fee_structure_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
  student_id SERIAL PRIMARY KEY,
  user_id INT NULL,
  roll_number VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  course VARCHAR(50) NOT NULL,
  semester_year VARCHAR(10) NOT NULL,
  contact_number VARCHAR(15),
  email VARCHAR(100),
  category VARCHAR(20) NOT NULL DEFAULT 'regular' CHECK (category IN ('regular', 'scholarship')),
  fee_structure_id INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_students_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(fee_structure_id)
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  fee_head_id INT NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('online', 'cash', 'cheque', 'dd')),
  gateway VARCHAR(50),
  transaction_id VARCHAR(100) UNIQUE,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'pending', 'failed')),
  recorded_by VARCHAR(50) DEFAULT 'student',
  CONSTRAINT fk_payments_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_head FOREIGN KEY (fee_head_id) REFERENCES fee_heads(fee_head_id)
);

CREATE TABLE IF NOT EXISTS receipts (
  receipt_id SERIAL PRIMARY KEY,
  payment_id INT UNIQUE NOT NULL,
  receipt_number VARCHAR(30) UNIQUE NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_path VARCHAR(255),
  CONSTRAINT fk_receipts_payment FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('reminder', 'confirmation')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_notifications_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(255) NOT NULL,
  entity_affected VARCHAR(50),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

INSERT INTO users (username, name, email, password_hash, role)
VALUES
  ('saiprakash', 'Sai Prakash', 'saiprakash9813@gmail.com', 'Sai@1978', 'admin'),
  ('staff', 'Mrs. Sunita Verma', 'staff@fms.edu', 'demo123', 'staff'),
  ('arjun', 'Arjun Sharma', 'student@fms.edu', 'demo123', 'student')
ON CONFLICT (username) DO NOTHING;
