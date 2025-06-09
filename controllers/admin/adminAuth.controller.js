import Admin from "../../models/AdminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../configs/config.js";

// get admin details
export const getAdminDetails = async (req, res) => {
  console.log("> reached getAdminDetails controller");
  try {
    // req.admin is set by the verifyAdminToken middleware
    const admin = req.admin;
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({
      message: "Admin details accessed successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("> Error getting admin details: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRATION || "1h",
  });
};

export const loginAdmin = async (req, res) => {
  console.log("> reached loginAdmin controller");
  try {
    const { username, password } = req.body;

    // Find the admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = generateToken(admin._id);

    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ token, message: "Admin logged in successfully" });
  } catch (error) {
    console.error("> Error logging in admin: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin with this username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 5);

    // Create a new admin
    const newAdmin = new Admin({
      name,
      username,
      password: hashedPassword,
    });

    // Save the admin to the database
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("> Error registering admin: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
