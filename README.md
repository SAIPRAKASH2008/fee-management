# Fee Management System (FMS)

A web application designed to automate fee collection, track dues, manage college branch fee structures, generate receipts, and produce financial reports.

---

## 📁 Project Architecture & Structure

```
Fee_Management_System/
│
├── frontend/                     # Client-Side Application (HTML5, CSS3, Vanilla JS, Chart.js, jsPDF)
│   ├── index.html                # Portal Login Page with Demo Credentials & Role Selection
│   ├── dashboard.html            # Main Application Shell (SPA)
│   ├── css/
│   │   └── style.css             # Complete Dark Glassmorphism Design System
│   ├── js/
│   │   ├── app.js                # Core Router, State Management, Toast & Modals
│   │   ├── data.js               # College Database & LocalStorage Synchronization
│   │   ├── admin.js              # Administrator Module (Branch Fee Structures, Defaulters, Reports)
│   │   ├── student.js            # Student Portal (Dues, 4 Payment Gateways, Ledger)
│   │   ├── staff.js              # Staff/Accountant Module (Student Registration, Offline Payments)
│   │   ├── charts.js             # Real-time Chart.js Analytics (Doughnut, Bar, Pie)
│   │   └── receipt.js            # Automated jsPDF Receipt Generation & PDF Download
│   └── assets/                   # Static Icons & Branding Assets
│
├── backend/                      # Server-Side Application (Node.js, Express.js, REST API, MySQL)
│   ├── server.js                 # Express Application Entry Point
│   ├── package.json              # Backend Dependencies & Scripts
│   ├── schema.sql                # Relational Database Schema (MySQL tables from SDD)
│   ├── .env.example              # Environment Configuration Template
│   ├── config/
│   │   └── db.js                 # MySQL Database Connection Pool
│   ├── models/
│   │   └── dataStore.js          # In-Memory Fallback & Domain Models
│   ├── controllers/
│   │   ├── authController.js     # User Authentication & Role Verification
│   │   ├── studentController.js  # Student CRUD & Enrollment Operations
│   │   ├── feeController.js      # Fee Structure & Fee Head Management
│   │   ├── paymentController.js  # Transaction Processing & Receipts
│   │   └── reportController.js   # Analytics Aggregation & Audit Logs
│   └── routes/
│       ├── authRoutes.js         # /api/auth Endpoints
│       ├── studentRoutes.js      # /api/students Endpoints
│       ├── feeRoutes.js          # /api/fees Endpoints
│       ├── paymentRoutes.js      # /api/payments Endpoints
│       └── reportRoutes.js       # /api/reports Endpoints
│
└── README.md                     # Project Documentation & Setup Guide
```

---

## 🔑 Login Credentials

| Role | User ID / Email | Password | Permissions |
|---|---|---|---|
| 👤 **Administrator (Sai Prakash)** | `saiprakash9813@gmail.com` | `Sai@1978` | Full system control, branch fee structures, student records, audit logs, financial reports |
| 💼 **Accountant / Staff** | `staff@fms.edu` | `demo123` | Register joining students, record offline payments (Cash/Cheque/DD), print receipts |
| 🎓 **Student (Arjun Sharma)** | `student@fms.edu` | `demo123` | View dues, pay online via 4 payment gateways, download PDF receipts |

---

## 🎓 Supported College Branches & Exact Semesters

The application supports all standard collegiate departments across Engineering, Sciences, Management, and Commerce:
- **Engineering (B.Tech & M.Tech):** `B.Tech CSE`, `B.Tech ECE`, `B.Tech Mechanical`, `B.Tech Civil`, `B.Tech EEE`, `B.Tech IT`, `B.Tech AI & DS`, `B.Tech Chemical`, `B.Tech Biotechnology`, `M.Tech CSE`, `M.Tech VLSI`
- **Sciences (B.Sc):** `B.Sc Computer Science`, `B.Sc Mathematics`, `B.Sc Physics`, `B.Sc Chemistry`
- **Applications:** `BCA`, `MCA`
- **Commerce & Management:** `B.Com General`, `B.Com Computers`, `B.Com Honours`, `BBA`, `MBA`
- **Semesters:** Explicit selection from `Sem 1` to `Sem 8` (no random values; fees are automatically bound to the exact course and semester).

---

## 💳 Payment Gateway Integrations (Student Portal)

1. **⚡ Razorpay Gateway** — Server-created orders, Checkout, and HMAC signature verification for debit / credit card payments.
2. **📱 UPI / QR Code (PhonePe, Google Pay, Paytm, BHIM)** — Live dynamic QR code generator with scanner and VPA ID verification.
3. **🌐 Stripe Global** — International multi-currency card checkout (Visa, MasterCard, Amex).
4. **🏦 Direct Net Banking** — Instant bank selection (SBI, HDFC Bank, ICICI Bank, Axis Bank, Kotak, PNB).

---

## 🚀 How to Run the Project

### Option A: Running the Frontend (Standalone / Academic Demo)
1. Open the `frontend/` folder.
2. Double-click or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
3. No build tools or server setup required. All data persists in browser `localStorage`.

---

### Option B: Running the Backend REST API Server (Node.js & Express)
1. Ensure **Node.js** (v16+) is installed on your system.
2. Open terminal in the `backend/` folder:
   ```bash
   cd backend
   npm install
   ```
3. *(Optional)* Setup MySQL database:
   - Import `schema.sql` into PostgreSQL.
   - Copy `.env.example` to `.env` and configure your database credentials and Razorpay keys.
   - Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`.
   - Put the public `RAZORPAY_KEY_ID` in the `window.RAZORPAY_KEY_ID` value in `frontend/dashboard.html`.
4. Start the server:
   ```bash
   npm start
   ```
5. The API server will be live at `http://localhost:5000`.

---

## 📡 Backend API Endpoints Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | User login & JWT issuance | Public |
| `GET` | `/api/auth/users` | List all registered users | Admin |
| `GET` | `/api/students` | Get all students (filter by branch/status) | Admin, Staff |
| `POST` | `/api/students` | Register a new student | Admin, Staff |
| `PUT` | `/api/students/:id` | Update student profile | Admin, Staff |
| `GET` | `/api/fees/structures` | Get branch fee structures | All Roles |
| `POST` | `/api/fees/structures` | Create a new fee structure | Admin |
| `GET` | `/api/payments` | Get all payment transactions | Admin, Staff |
| `POST` | `/api/payments` | Record online / offline payment | All Roles |
| `POST` | `/api/payments/razorpay/order` | Create a server-side Razorpay order | Student |
| `POST` | `/api/payments/razorpay/verify` | Verify signature and record payment receipts | Student |
| `GET` | `/api/reports/stats` | Get dashboard statistical metrics | Admin |
| `GET` | `/api/reports/audit-logs` | Retrieve system audit logs | Admin |

---

## 📜 Technologies Used

- **Frontend:** HTML5, CSS3 (Custom Glassmorphism Design System), JavaScript (ES6+), Chart.js, jsPDF.
- **Backend:** Node.js, Express.js, RESTful API architecture, CORS, Dotenv.
- **Database:** MySQL relational schema (compatible with MySQL 8.0+ & SQLite).
- **Standards:** IEEE 830 SRS compliant.
