<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&pause=1000&color=4EA94B&center=true&vCenter=true&width=600&lines=🌱+SkillSprout+Backend+API;Built+for+Scale.+Built+for+Security." alt="Typing SVG" />

<br/>

<p align="center">
  <strong>A robust, secure, and scalable RESTful API — the engine powering a modern EdTech platform.</strong>
</p>

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/vaneetsingh/SkillSprout-Backend-API?style=social)](https://github.com/vaneetsingh/SkillSprout-Backend-API)
[![GitHub Forks](https://img.shields.io/github/forks/vaneetsingh/SkillSprout-Backend-API?style=social)](https://github.com/vaneetsingh/SkillSprout-Backend-API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<br/>

> 🔗 **[Explore the Full API Documentation on Postman →](https://documenter.getpostman.com/view/46282483/2sBXiomVVF)**

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture & Features](#-architecture--features)
- [Tech Stack](#-tech-stack)
- [API Structure](#-api-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Security Philosophy](#-security-philosophy)
- [Author](#-author)

---

## 🌍 Overview

**SkillSprout** is a production-grade backend system designed for a comprehensive e-learning experience. It manages intricate data relationships between **Students**, **Instructors**, and **Courses** — while maintaining airtight security through RBAC, JWT-based auth, and cryptographically verified payment processing.

Whether you're a student enrolling in a course, an instructor publishing content, or an admin maintaining the platform — every interaction is handled with precision and security at its core.

---

## ⚙️ Architecture & Features

<table>
  <tr>
    <td width="50%" valign="top">

### 🔐 Authentication System
Email OTP verification powered by **Nodemailer** and Mongoose **Pre-Save hooks** ensures only verified users can access the platform — eliminating fake accounts and maintaining database integrity from the ground up.

---

### 🛡️ Role-Based Access Control
Strict middleware authorization enforces permissions based on user roles. Actions are locked down at the route level — only the right role can touch the right resource.

| Role | Permissions |
|------|-------------|
| `Student` | Enroll, view, review |
| `Instructor` | Create, edit, publish |
| `Admin` | Full platform control |



### 💳 Cryptographic Payment Security
Integrated **Razorpay** with server-side `crypto` HMAC SHA256 signature verification. Course prices are fetched dynamically from the database at order creation — **any frontend price payload is completely ignored**, making client-side tampering impossible.

---

### ☁️ Cloud Media Management
**Cloudinary** handles all image and video uploads securely. Temporary file storage is used during processing to optimize server memory and keep response times fast.

  </tr>
</table>

### 🤖 Automated Database Maintenance
A `node-cron` scheduled task silently runs in the background, automatically sweeping and deleting expired or ghost user accounts — keeping the database lean and performant without any manual intervention.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB + Mongoose ODM |
| **Authentication** | JWT + bcrypt |
| **File Handling** | express-fileupload |
| **Payments** | Razorpay |
| **Media Storage** | Cloudinary |
| **Email Service** | Nodemailer (Gmail SMTP) |
| **Task Scheduling** | node-cron |

---

## 📡 API Structure

```
SkillSprout-Backend-API/
├── 📁 config/          # DB connection & Cloudinary setup
├── 📁 controllers/     # Route logic (Auth, Course, Payment, Profile)
├── 📁 middlewares/     # Auth guard & RBAC middleware
├── 📁 models/          # Mongoose schemas (User, Course, OTP, etc.)
├── 📁 routes/          # Express routers
├── 📁 utils/           # Mail sender, image uploader, helpers
├── 📄 .env.example     # Environment variable template
├── 📄 index.js         # App entry point
└── 📄 package.json
```

> 📬 For the complete list of endpoints, request/response schemas, and example payloads — **[see the Postman Docs](https://documenter.getpostman.com/view/46282483/2sBXiomVVF)**.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+`
- A running MongoDB cluster (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- Accounts on Razorpay, Cloudinary, and a Gmail address with App Password enabled

### 1. Clone the Repository

```bash
git clone https://github.com/vaneetsingh/SkillSprout-Backend-API.git
cd SkillSprout-Backend-API
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in your credentials — see the section below for all required variables.

### 4. Start the Development Server

```bash
npm run dev
```

✅ Server live at **`http://localhost:4000`**

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following:

```env
# ── Server ──────────────────────────────────────────
PORT=4000
MONGODB_URL=your_mongodb_cluster_url

# ── Security ────────────────────────────────────────
JWT_SECRET=your_strong_jwt_secret

# ── Mail Service (Gmail App Password) ───────────────
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_gmail_address
MAIL_PASSWORD=your_gmail_app_password

# ── Cloudinary ──────────────────────────────────────
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# ── Razorpay ────────────────────────────────────────
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_key_secret
```

> ⚠️ **Never commit your `.env` file.** It's already included in `.gitignore`.

---

## 🔒 Security Philosophy

This API was built with a **"Zero-Trust"** mindset — every layer is treated as potentially compromised until proven otherwise.

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                      │
├─────────────────────────────────────────────────────────┤
│  🔑  Passwords hashed with bcrypt (never stored raw)    │
│  🎫  JWT tokens validated on every protected request    │
│  🛡️  RBAC middleware guards all sensitive routes        │
│  💰  Payment amounts sourced ONLY from the database     │
│  🌐  CORS explicitly configured per allowed origin      │
│  🧹  Cron job purges stale/ghost accounts automatically │
└─────────────────────────────────────────────────────────┘
```

---

## 👨‍💻 Author

<div align="center">

**Vaneet Singh**

*Architected and engineered with precision.*

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vaneetsingh26)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/vaneetsingh26)

<br/>

*If you found this project helpful, please consider giving it a ⭐ — it means a lot!*

</div>

---

<div align="center">
  <sub>Built with ☕ and a lot of <code>console.log</code> debugging.</sub>
</div>