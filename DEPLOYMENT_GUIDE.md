# 🚀 PayFlow Deployment Guide

This guide will help you deploy your PayFlow UPI Simulator using **Render** (Backend & Database) and **Vercel** (Frontend).

---

## 🌍 Overview
- **Database:** Render PostgreSQL (Free Tier)
- **Backend (API):** Render Web Service (Node.js)
- **Frontend:** Vercel (React Vite)

---

## 🛠️ Step 1: Deploy Database (Render)

1.  Log in to [Render.com](https://render.com).
2.  Click **New +** > **PostgreSQL**.
3.  Name your database (e.g., `payflow-db`).
4.  Choose the **Free** instance type.
5.  Click **Create Database**.
6.  Once created, copy the **Internal Database URL** (for backend) and **External Database URL** (for local testing/migrations).

---

## 🛠️ Step 2: Deploy Backend (Render)

1.  Click **New +** > **Web Service**.
2.  Connect your GitHub repository: `govardhareddy23/payFlow`.
3.  Fill in the details:
    - **Name:** `payflow-api`
    - **Root Directory:** `server`
    - **Environment:** `Node`
    - **Build Command:** `npm install`
    - **Start Command:** `npm run start`
4.  Click **Advanced** and add **Environment Variables**:
    - `DATABASE_URL`: (Paste your Render PostgreSQL Internal URL)
    - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: (Copy values from your Render DB dashboard)
    - `JWT_SECRET`: (Any secure long string)
    - `EMAIL_USER`: (Your Gmail)
    - `EMAIL_PASS`: (Your Gmail App Password)
    - `NODE_ENV`: `production`
5.  Click **Create Web Service**.
6.  Wait for deployment to finish. Copy the URL (e.g., `https://payflow-api.onrender.com`).

---

## 🛠️ Step 3: Initialize Database Schema

Since Render doesn't run your migration script automatically:
1.  Open your local terminal.
2.  In the `server` folder, temporarily update your `.env` `DATABASE_URL` to the **External Database URL** from Render.
3.  Run: `npm run db:init`
4.  Run: `npm run db:seed` (optional).
5.  **Important:** Change your local `.env` back to `localhost` after this.

---

## 🛠️ Step 4: Deploy Frontend (Vercel)

1.  Log in to [Vercel](https://vercel.com).
2.  Click **Add New** > **Project**.
3.  Import your GitHub repository: `govardhareddy23/payFlow`.
4.  In the **Configure Project** screen:
    - **Root Directory:** Edit and select `client`.
    - **Framework Preset:** Vite (should be auto-detected).
5.  Open **Environment Variables** and add:
    - `VITE_API_BASE_URL`: `https://your-render-backend-url.onrender.com/api`
6.  Click **Deploy**.

---

## 🏁 Final Check
Once Vercel finishes:
1.  Visit your Vercel URL (e.g., `https://payflow.vercel.app`).
2.  Try to login/register.
3.  The frontend will communicate with the Render API, which in turn talks to the Render PostgreSQL database.

---

## 💡 Troubleshooting
- **CORS Errors:** If you see CORS errors from the frontend, you'll need to update `server/src/index.js` to allow your Vercel URL in `cors()`.
- **Database Connection:** Ensure you are using the *Internal* URL for Render-to-Render communication (backend to DB).
- **Vercel Build Fails:** Ensure you selected `client` as the **Root Directory** in Vercel settings.
