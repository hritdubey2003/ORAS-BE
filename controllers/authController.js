import bcrypt from "bcryptjs";
import pool from "../db/db.js";
import generateToken from "../utils/generateToken.js";
import logger from "../helper/logger.js";
import { findUserByEmail, findUserById, findUserByPhone } from "../models/userModel.js";
const SALT_ROUNDS = 10;

export const register = async (req, res, next) => {
  try {
    logger.info("Called Register API: POST /register");
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "full_name, email, password, and role are required",
      });
    }

    const allowedRoles = ["customer", "provider", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed: customer, provider, admin",
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check phone uniqueness if provided
    if (phone) {
      const existingPhone = await findUserByPhone(phone);

      if (existingPhone.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "User with this phone already exists",
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await createUser({
      full_name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

// POST /login
export const login = async (req, res, next) => {
  try {
    logger.info("Called Login API: POST /login");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const result = await findUserByEmail(email.toLowerCase());

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, 
      path: "/",
    });

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      is_verified: user.is_verified,
      created_at: user.created_at,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: safeUser
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    logger.info("Called Get Profile API: GET /getProfile");
    const userId = req.user.userId;

    const result = await findUserById(userId);  

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    logger.info("Called Logout API: GET /logout");
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "lax"
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
