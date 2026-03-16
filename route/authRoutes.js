import express from "express";
import { register, login, getUserProfile, logout } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authmiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getProfile", authMiddleware, getUserProfile);
router.get("/logout" , logout);

export default router;