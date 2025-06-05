import jwt from "jsonwebtoken";
import config from "../configs/config.js";
import Admin from "../models/AdminModel.js";

export const verifyAdminToken = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    jwt.verify(token, config.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }

      // Find the admin based on the decoded ID
      const admin = await Admin.findById(decoded.id).select("-password"); // Exclude password from the fetched admin
      if (!admin) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Admin not found" });
      }

      // Attach the admin object to the request for further use
      req.admin = admin;
      next(); // Proceed to the next middleware or route handler
    });
  } catch (error) {
    console.error("> Error verifying admin token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
