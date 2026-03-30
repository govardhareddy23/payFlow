# 🚀 Real-Time Auth Setup Guide

I have updated the code to support real OTPs via Email and SMS. To activate them, you just need to provide your personal keys in the following files:

---

## 1. Real Emails (Gmail)
Go to your **[Google App Passwords](https://myaccount.google.com/apppasswords)** page.
1. Generate a new App Password (name it "PayFlow").
2. Open the file: `server/.env`
3. Update these lines:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

---

## 2. Real SMS (Firebase)
Go to the **[Firebase Console](https://console.firebase.google.com/)**.
1. Create a project named "PayFlow".
2. Enable **Phone Authentication** in the "Authentication" section.
3. Add a **Web App** to the project.
4. Copy the `firebaseConfig` object it gives you.
5. Open the file: `client/src/firebase.js`
6. Paste your config into the `firebaseConfig` variable.

---

### 🧪 How to test
Once you add the keys, restart your servers (`npm run dev`) and try to log in with a real mobile number or email. You will receive a real SMS and a real email immediately!
