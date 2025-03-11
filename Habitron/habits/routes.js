import express from "express";
import db from "../config/firebase-admin.js";  // Import Firestore instance

const router = express.Router();
const habitsCollection = db.collection("habits");

// 1️⃣ Get all habits for a specific user
router.get("/", async (req, res) => {
  const { userId } = req.query; // Retrieve userId from query parameters
  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    const snapshot = await habitsCollection.where("userId", "==", userId).get();
    const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch habits", error });
  }
});

// 2️⃣ Add a new habit (must include userId)
router.post("/", async (req, res) => {
  const { userId, name, icon } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ message: "Missing required fields: userId, name" });
  }

  try {
    const docRef = await habitsCollection.add({ userId, name, icon });
    res.status(201).json({ id: docRef.id, userId, name, icon });
  } catch (error) {
    res.status(500).json({ message: "Failed to add habit", error });
  }
});

// 3️⃣ Update an existing habit (must belong to the user)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId, name, icon } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    const habitDoc = habitsCollection.doc(id);
    const habitSnapshot = await habitDoc.get();

    if (!habitSnapshot.exists) {
      return res.status(404).json({ message: "Habit not found" });
    }

    if (habitSnapshot.data().userId !== userId) {
      return res.status(403).json({ message: "Unauthorized to update this habit" });
    }

    await habitDoc.update({ name, icon });
    res.json({ id, name, icon });
  } catch (error) {
    res.status(500).json({ message: "Failed to update habit", error });
  }
});

// 4️⃣ Delete a habit (must belong to the user)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // User ID should be in the request body

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    const habitDoc = habitsCollection.doc(id);
    const habitSnapshot = await habitDoc.get();

    if (!habitSnapshot.exists) {
      return res.status(404).json({ message: "Habit not found" });
    }

    if (habitSnapshot.data().userId !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this habit" });
    }

    await habitDoc.delete();
    res.json({ message: `Habit with ID ${id} deleted` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete habit", error });
  }
});

export default router;
