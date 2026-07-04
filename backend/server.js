import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();   // ← This must come first

app.use(express.static(path.join(__dirname, "../frontend"))); // ← After app is created
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import User from "./models/User.js";
import Senior from "./models/Senior.js";
import { Staff } from "./models/Staff.js";

dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ================= SIGNUP ================= */
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user"   // default user
    });

    res.json({ success: true, message: "Signup successful" });
  } catch (err) {
    res.json({ success: false, message: "Signup error" });
  }
});

/* ================= LOGIN ================= */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email});
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      role: user.role   // 🔥 IMPORTANT FOR REDIRECT
    });
  } catch (err) {
    res.json({ success: false, message: "Login error" });
  }
});

/* =====================
   ADD SENIOR
===================== */
app.post("/api/seniors", async (req, res) => {
  try {
    const { name, dob, gender, address, phone } = req.body;

    if (!name || !dob || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, DOB and Phone are required"
      });
    }

    // Calculate Age from DOB
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    const senior = await Senior.create({
      name,
      dob,
      age,
      gender,
      address,
      phone
    });

    res.status(201).json({
      success: true,
      message: "Senior added successfully",
      senior
    });
  } catch (err) {
    console.error("Add senior error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add senior"
    });
  }
});

/* =====================
   GET ALL SENIORS
===================== */
app.get("/api/seniors", async (req, res) => {
  try {
    const seniors = await Senior.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      seniors
    });
  } catch (err) {
    console.error("Get seniors error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seniors"
    });
  }
});

/* =====================
   UPDATE SENIOR
===================== */
app.put("/api/seniors/:id", async (req, res) => {
  try {
    const senior = await Senior.findById(req.params.id);
    if (!senior) {
      return res.status(404).json({
        success: false,
        message: "Senior not found"
      });
    }

    const { name, dob, gender, address, phone } = req.body;

    if (dob) {
      const birth = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      senior.age = age;
      senior.dob = dob;
    }

    if (name) senior.name = name;
    if (gender) senior.gender = gender;
    if (address) senior.address = address;
    if (phone) senior.phone = phone;

    await senior.save();

    res.json({
      success: true,
      message: "Senior updated successfully",
      senior
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update senior"
    });
  }
});

/* =====================
   DELETE SENIOR
===================== */
app.delete("/api/seniors/:id", async (req, res) => {
  try {
    const senior = await Senior.findById(req.params.id);
    if (!senior) {
      return res.status(404).json({
        success: false,
        message: "Senior not found"
      });
    }

    await Senior.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Senior deleted successfully"
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete senior"
    });
  }
});

// // Routes

app.get('/api/staff', async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const newStaff = new Staff(req.body);
    await newStaff.save();
    res.json({ message: "Staff added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE staff
app.put('/api/staff/:id', async (req, res) => {
    try {
        const updatedStaff = await Staff.findByIdAndUpdate(
            req.params.id,   // staff ID from URL
            req.body,        // updated data: { name, email, role, shift }
            { new: true }    // return the updated document
        );
        res.json({ message: "Staff updated successfully", staff: updatedStaff });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =====================
   SERVER
===================== */
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
