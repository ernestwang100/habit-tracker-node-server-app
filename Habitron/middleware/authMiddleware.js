import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../config/firebase-admin.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.userId = decoded.userId;
    
    // Verify if user exists in Firestore
    const userDoc = await db.collection("users").doc(req.userId).get();
    if (!userDoc.exists) {
      return res.status(401).json({ message: "Invalid token. User does not exist." });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

export default authMiddleware;
