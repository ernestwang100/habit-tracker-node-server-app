import express from "express";
import db from "../config/firebase-admin.js";  // Import Firestore instance

const router = express.Router();
const habitLogsCollection = db.collection("habitLogs");

// 1. Get all habit logs
router.get("/", async (req, res) => {
  try {
    const snapshot = await habitLogsCollection.get();  // Fetch data from Firestore
    const habitLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));  // Map to add document IDs
    res.json(habitLogs);  // Send the habit log entries as response
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch habit logs", error });
  }
});

// 2. Add a new habit log entry
router.post("/", async (req, res) => {
  const { date, habitCompletions } = req.body;

  try {
    // Create a new habit log entry in Firestore
    const newLogRef = await habitLogsCollection.add({
      date,
      habitCompletions: habitCompletions || [],
      streakDays: 0,  // Initial streak days
      allHabitsCompleted: habitCompletions.every(h => h.completed)  // Check if all habits are completed
    });
    
    const newLog = { id: newLogRef.id, date, habitCompletions };
    res.status(201).json(newLog);  // Respond with the newly created habit log entry
  } catch (error) {
    res.status(500).json({ message: "Failed to add habit log", error });
  }
});

// 3. Update an existing habit log entry by date
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { date, habitCompletions, streakDays, allHabitsCompleted } = req.body;

  try {
    // Find the habit log by date
    const logDoc = habitLogsCollection.doc(id); 
    const logSnapshot = await logDoc.get();

    if (!logSnapshot.exists) {
      return res.status(404).json({ message: "Habit log not found" });
    }

    // Update the habit log entry
    await logDoc.update({
      date: date !== undefined ? date : logSnapshot.data().date,
      habitCompletions: habitCompletions || logSnapshot.data().habitCompletions,
      streakDays: streakDays !== undefined ? streakDays : logSnapshot.data().streakDays,
      allHabitsCompleted: allHabitsCompleted !== undefined ? allHabitsCompleted : logSnapshot.data().allHabitsCompleted
    });

    res.json({ id, date, habitCompletions, streakDays, allHabitsCompleted });
  } catch (error) {
    res.status(500).json({ message: "Failed to update habit log", error });
  }
});

// 4. Delete a habit log entry by date
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the habit log by date
    const logDoc = habitLogsCollection.doc(id);  // Assuming date is unique for each log
    const logSnapshot = await logDoc.get();

    if (!logSnapshot.exists) {
      return res.status(404).json({ message: "Habit log not found" });
    }

    // Delete the habit log entry
    await logDoc.delete();

    res.json({ message: `Habit log for ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete habit log", error });
  }
});

export default router;
