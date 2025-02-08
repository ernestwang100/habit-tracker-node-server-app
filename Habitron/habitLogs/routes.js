import express from "express";
import db from "../config/firebase-admin.js";  // Import Firestore instance

const router = express.Router();
const habitLogsCollection = db.collection("habitLogs");

// 1. Get all habit logs
router.get("/", async (req, res) => {
  try {
    const snapshot = await habitLogsCollection.get();
    const habitLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(habitLogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch habit logs", error });
  }
});

// 2. Add a new habit log entry
router.post("/", async (req, res) => {
  const { date, habitCompletions } = req.body;

  try {
    const newLogRef = await habitLogsCollection.add({
      date,
      habitCompletions: habitCompletions || [],
      streakDays: 0,
      allHabitsCompleted: habitCompletions.every(h => h.completed),
    });

    const newLog = { id: newLogRef.id, date, habitCompletions };
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ message: "Failed to add habit log", error });
  }
});

router.put("/batchUpdate", async (req, res) => {
  console.log("🔥 Received batch update request");  // Log when this endpoint is hit

  const updatedLogs = req.body;  // Array of habit logs to update

  console.log("📋 Data received:", JSON.stringify(updatedLogs, null, 2)); // Log incoming data

  if (!Array.isArray(updatedLogs) || updatedLogs.length === 0) {
    console.log("❌ Invalid request data");
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const batch = db.batch();  // Create a Firestore batch

    updatedLogs.forEach((log) => {
      console.log(`📝 Updating log ID: ${log.id}`); // Log each log being updated
      const logRef = habitLogsCollection.doc(log.id);
      batch.update(logRef, {
        habitCompletions: log.habitCompletions,
      });
    });

    await batch.commit();  // Execute batch update

    console.log("✅ Batch update successful");  // Log success
    res.json({ message: "Habit logs updated successfully" });
  } catch (error) {
    console.error("❌ Batch update failed:", error);  // Log error
    res.status(500).json({ message: "Failed to update habit logs", error });
  }
});

// 3. Update an existing habit log entry by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { date, habitCompletions, streakDays, allHabitsCompleted } = req.body;

  try {
    const logDoc = habitLogsCollection.doc(id);
    const logSnapshot = await logDoc.get();

    if (!logSnapshot.exists) {
      return res.status(404).json({ message: "Habit log not found" });
    }

    await logDoc.update({
      date: date !== undefined ? date : logSnapshot.data().date,
      habitCompletions: habitCompletions || logSnapshot.data().habitCompletions,
      streakDays: streakDays !== undefined ? streakDays : logSnapshot.data().streakDays,
      allHabitsCompleted: allHabitsCompleted !== undefined ? allHabitsCompleted : logSnapshot.data().allHabitsCompleted,
    });

    res.json({ id, date, habitCompletions, streakDays, allHabitsCompleted });
  } catch (error) {
    res.status(500).json({ message: "Failed to update habit log", error });
  }
});

// 4. Delete a habit log entry by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const logDoc = habitLogsCollection.doc(id);
    const logSnapshot = await logDoc.get();

    if (!logSnapshot.exists) {
      return res.status(404).json({ message: "Habit log not found" });
    }

    await logDoc.delete();

    res.json({ message: `Habit log for ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete habit log", error });
  }
});



export default router;
