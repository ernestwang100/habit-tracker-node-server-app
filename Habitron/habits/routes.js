import express from "express";
import db from "../config/firebase-admin.js";  // Import Firestore instance

const router = express.Router();
const habitsCollection = db.collection("habits");

// 1️⃣ Get all habits
router.get("/api/habits", async (req, res) => {
  try {
    const snapshot = await habitsCollection.get();
    const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch habits", error });
  }
});

// 2️⃣ Add a new habit
router.post("/api/habits", async (req, res) => {
  const { name, icon } = req.body;
  try {
    const docRef = await habitsCollection.add({ name, icon });
    res.status(201).json({ id: docRef.id, name, icon });
  } catch (error) {
    res.status(500).json({ message: "Failed to add habit", error });
  }
});

// 3️⃣ Update an existing habit by ID
router.put("/api/habits/:id", async (req, res) => {
  const { id } = req.params;
  const { name, icon } = req.body;
  
  try {
    const habitDoc = habitsCollection.doc(id);
    await habitDoc.update({ name, icon });
    res.json({ id, name, icon });
  } catch (error) {
    res.status(500).json({ message: "Failed to update habit", error });
  }
});

// 4️⃣ Delete a habit by ID
router.delete("/api/habits/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const habitDoc = habitsCollection.doc(id);
    await habitDoc.delete();
    res.json({ message: `Habit with ID ${id} deleted` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete habit", error });
  }
});

export default router;
