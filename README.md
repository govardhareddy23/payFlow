# 🚀 PayFlow - Premium UPI Payment Simulator

PayFlow is a high-performance, production-ready UPI-style payment simulator built using the **MERN** stack (with PostgreSQL). It features a clean, minimalist UI, secure authentication, and real-time transaction processing with dynamic recipient lookup.

---

## ✨ Features

- 💎 **Premium Light UI:** Clean, modern, and minimalist design with soft shadows and smooth animations.
- 🔐 **Secure Auth:** Multi-factor authentication via Email OTP (unified verification).
- 💰 **Balance Privacy:** Hide/Show balance toggle with a sleek "monkey" icon interaction.
- 🔍 **Real-time Lookup:** Dynamically search and display recipient names as you type.
- 🛡️ **Atomic Transactions:** Secure PostgreSQL transactions with row-level locks to prevent race conditions.
- 📜 **Transaction History:** Detailed logs with status tracking (SUCCESS/PENDING/FAILED).
- 📱 **Mobile Responsive:** Designed to look and feel like a native fintech application.

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Vanilla CSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (with `pg` driver)
- **Security:** Bcrypt (PIN Hashing), JWT (Authentication), Helmet (Security Headers)
- **Mailing:** Nodemailer (Real-time Email OTPs)

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (running locally or in the cloud)
- **Gmail Account** (for sending OTPs via App Password)

### ⚙️ Setup Instructions

#### 1. Database Setup
- Create a database in PostgreSQL called `payflow`.
- Duplicate the `.env.example` in the `server` folder (if provided) or create one:
```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=payflow
DB_PORT=5432
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

#### 2. Initialize Backend
```bash
cd server
npm install
npm run db:init # Creates schema
npm run db:seed # Optional: Seeds demo data
npm run dev     # Starts dev server
```

#### 3. Initialize Frontend
```bash
cd client
npm install
npm run dev     # Starts Vite dev server (usually http://localhost:5173)
```

---

## 🌍 Deployment

For detailed instructions on how to deploy this application to **Render** (Backend/DB) and **Vercel** (Frontend), please see the [**Deployment Guide**](./DEPLOYMENT_GUIDE.md).

---

## 📱 Screenshots & Demo

After setup, you can register a new account or use the seeded demo accounts:
- **Default PIN:** `123456`

---

## 📄 License
MIT License. Created by [Govardhan Reddy](https://github.com/govardhareddy23).
