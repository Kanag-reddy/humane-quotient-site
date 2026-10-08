# Humane Quotient (HuQ) — React & MongoDB Web Application

Interactive web application for the **Humane Quotient (HuQ)**, built with **React, Vite, Express, and MongoDB**.

Based on the book *“Test Your Humane Quotient”* (First Edition, Revised) by **Dr Rachiraju Sai Krishna & Prof Dr Thothathri Venugopal** from the **Sri Sathya Sai University for Human Excellence**.

---

## Architecture & Tech Stack

- **Frontend**: **React 18** with **Vite**
  - Modular React components and Context providers (`AuthContext`, `TestContext`).
  - Gated bloom sequence animation with closed flower bud, FLIP layout transition, scores count-up, and confetti celebration.
  - Interactive SVG infographics: 8-petal blooming flower, Evolution of Care stream, and falling ambient petals.
  - Mobile-first responsive styling preserved with the 9-color palette, fluid typography, and accessibility features.
- **Backend**: **Node.js + Express 5**
  - Unified REST API for authentication, submissions, and admin services.
  - **MongoDB** integration with Mongoose models (`User`, `Submission`).
  - Resilient Data Access Layer (DAL) with automatic persistent JSON fallback if MongoDB is not running locally.
  - Password hashing with **bcryptjs** and token issuance with **jsonwebtoken (JWT)**.
  - HTML report emailing using **Nodemailer**.
  - Spreadsheet export via **ExcelJS**.

---

## Key Features

1. **User Authentication & Guest Mode**:
   - **Guest Mode**: Users can take the 96-question test and receive their profile and action plan immediately without logging in.
   - **Registered User Mode**: Users can sign up and log in. Their test history is securely associated with their user account and accessible under the **My History** dashboard.
2. **Result Download & Email Sharing**:
   - **Print / Save as PDF**: Users can print or save their full profile or action plan.
   - **Email Sharing**: Users can enter any email address to dispatch their formatted HTML HuQ report directly.
3. **Admin Console & User Data Query**:
   - Dedicated Administrator Console (`#/admin`).
   - Overview metrics: Total test submissions, registered users vs guests, average HuQ quotient, care-level breakdown (Self-Care, Socio-Care, Universal Care), and quotient averages.
   - **Search User by Email**: Enter any user's email address to inspect their full profile, all test attempts, scored quotients, demographics, and raw answers.
   - **Export to Excel**: Download the compiled `HuQ_Responses.xlsx` workbook directly from the browser.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
Create or edit `.env` in the project root:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/huq
JWT_SECRET=huq_jwt_secret_key_2026_super_secure

# Default Admin Credentials
ADMIN_EMAIL=admin@huq.org
ADMIN_PASSWORD=Admin@123

# Optional: Email Service (SMTP)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# MAIL_FROM="Humane Quotient" <your-email@gmail.com>
```

> **Note**: If MongoDB is not yet running on your machine or you haven't set up MongoDB Atlas, the backend automatically uses the built-in fallback store (`data/local_db.json`) so all features work immediately out-of-the-box!

### 3. Run Development Servers
- **Backend Server** (Port 5000):
  ```bash
  npm run server
  ```
- **React Frontend (Vite)** (Port 3000):
  ```bash
  npm run client
  ```
Open `http://localhost:3000` in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```
This builds the React app into `dist/` and runs the Express server on port 5000, serving the static React app and all API endpoints.

---

## Default Administrator Account
- **Email**: `admin@huq.org`
- **Password**: `Admin@123`
*(Configurable via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`)*
