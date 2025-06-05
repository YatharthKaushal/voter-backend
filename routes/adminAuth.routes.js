import express from "express";

import {
  registerAdmin,
  loginAdmin,
} from "../controllers/admin/adminAuth.controller.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

/**
 * @route POST api/auth/register
 * @desc Register a new admin
 * @access Public
 */
router.post("/register", registerAdmin);

/**
 * @route POST api/auth/login
 * @desc Login an existing admin and return a JWT token
 * @access Public
 */
router.post("/login", loginAdmin);

/**
 * @route GET api/admin/dashboard
 * @desc Access the admin dashboard (protected route)
 * @access Private (requires admin authentication via JWT)
 */
// TODO: bulk import/ export data.
router.get("/dashboard", verifyAdminToken, (req, res) => {
  res.json({
    message: "Admin dashboard accessed successfully",
    admin: req.admin,
  });
});

export default router;
