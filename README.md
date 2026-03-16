# ORAS Backend (Authentication Module)

A secure and scalable backend authentication module built with **Node.js**, **Express.js**, and **PostgreSQL** for the ORAS project.

This backend currently supports:

- User Registration
- User Login
- JWT-based Authentication
- Protected Profile Access
- Logout Functionality
- Error Handling Middleware
- Request Logging with Morgan and Winston
- SQL-based database initialization
- Model-based database access structure

---

## 🚀 Tech Stack

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **JWT (jsonwebtoken)**
- **bcryptjs**
- **cookie-parser**
- **cors**
- **helmet**
- **morgan**
- **winston**
- **dotenv**

---

## 📁 Project Structure

```bash
ORAS-BE/
│
├── controllers/
│   └── authController.js
│
├── db/
│   └── db.js
│
├── helper/
│   └── logger.js
│
├── logs/
│   ├── combined.log
│   └── error.log
│
├── middlewares/
│   ├── authMiddleware.js
│   └── errorHandler.js
│
├── models/
│   └── userModel.js
│
├── route/
│   └── authRoutes.js
│
├── sql/
│   └── init.sql
│
├── utils/
│   └── generateToken.js
│
├── .env
├── .gitignore
├── app.js
├── server.js
├── package.json
└── README.md