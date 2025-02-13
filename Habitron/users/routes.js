import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/firebase-admin.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const usersCollection = db.collection("users");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Signup Route
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existingUser = await usersCollection.where("email", "==", email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRef = await usersCollection.add({ email, password: hashedPassword });
    const user = { id: userRef.id, email };

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Error signing up", error });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userSnapshot = await usersCollection.where("email", "==", email).get();
    if (userSnapshot.empty) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Protected Route Example
router.get("/profile", authMiddleware, async (req, res) => {
  res.json({ message: "Protected user profile", user: req.user });
});

export default router;
