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
  - MongoDB is required for all account and submission storage; API requests return an error if the database is unavailable.
  - Production requires explicit MongoDB, JWT, and administrator environment variables; no default credentials or local database fallback are used.
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
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/huq?retryWrites=true&w=majority
JWT_SECRET=<generate-a-unique-random-secret-of-at-least-32-characters>

# Admin account (create/update it with `npm run admin:configure`)
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=use-a-strong-unique-password

# Optional: Email Service (SMTP)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# MAIL_FROM="Humane Quotient" <your-email@gmail.com>
```

> **Important**: Configure `MONGODB_URI`, `JWT_SECRET` (at least 32 characters), `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before starting the application. The app does not store accounts or submissions locally; API requests return HTTP 503 while MongoDB is unavailable. Run `npm run admin:configure` to create/update the configured admin. This command permanently deletes other admin accounts. Never commit `.env` or enter secrets in source code.

To copy the app's `users` and `submissions` collections from the database named in `MONGODB_URI` into a new `huq` database in the same Atlas cluster, run `npm run db:copy-to-huq` while the URI still points to the source database. The command refuses to overwrite a non-empty `huq` database and leaves the source unchanged. Then change the URI's database path to `/huq` in `.env` and Vercel. MongoDB creates collections (not relational tables); the app uses `users` and `submissions`.

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

### 5. Deploy to Vercel
1. Push the project to GitHub and import its repository into Vercel.
2. Set the project root to the directory containing `package.json`.
3. Use the Vite preset, `npm run build` as the build command, and `dist` as the output directory.
4. Add `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in Vercel's Production environment settings. Add the SMTP variables too if report email is required.
5. Deploy, then check `/api/health`, registration/login, test submission, and admin access.

The nested API entry point in `api/[...path].js` routes Express API paths on Vercel. Configure the Vercel environment values independently; local `.env` values are not uploaded during deployment.
