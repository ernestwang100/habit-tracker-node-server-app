import express from "express";
import db from "../config/firebase-admin.js";  // Import Firestore instance

const router = express.Router();
const habitLogsCollection = db.collection("habitLogs");

// 1. Get all habit logs
router.get("/", async (req, res) => {
  try {
    const snapshot = await habitLogsCollection.get();  // Await the promise to get the data
    const habitLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));  // Map to extract data and add doc id
    res.json(habitLogs);  // Send the habit log entries as response
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch habit logs", error });  // Handle errors properly
  }
});

// 2. Add a new habit log entry
router.post("/", (req, res) => {
  const { date, habitCompletions } = req.body;

  // Create a new habit log entry
  const newLog = {
    date,
    habitCompletions: habitCompletions || [], // habitCompletions should be an array of { habitId, completed }
    streakDays: 0, // initial streak days, can be updated later
    allHabitsCompleted: habitCompletions?.every((h) => h.completed) ?? false, // check if all habits are completed
  };

  Database.habitLogs.push(newLog);
  res.status(201).json(newLog); // Respond with the newly created habit log entry
});

// 3. Update an existing habit log entry
router.put("/:date", (req, res) => {
  const { date } = req.params;
  const { habitCompletions, streakDays, allHabitsCompleted } = req.body;

  // Find the habit log by date
  const logIndex = Database.habitLogs.findIndex((log) => log.date === date);

  if (logIndex === -1) {
    return res.status(404).json({ message: "Habit log not found" });
  }

  // Update the habit log entry
  const updatedLog = {
    ...Database.habitLogs[logIndex],
    habitCompletions: habitCompletions || Database.habitLogs[logIndex].habitCompletions,
    streakDays: streakDays ?? Database.habitLogs[logIndex].streakDays,
    allHabitsCompleted: allHabitsCompleted ?? Database.habitLogs[logIndex].allHabitsCompleted,
  };

  Database.habitLogs[logIndex] = updatedLog;

  res.json(updatedLog); // Respond with the updated habit log entry
});

// 4. Delete a habit log entry by date
router.delete("/:date", (req, res) => {
  const { date } = req.params;

  // Find the habit log by date
  const logIndex = Database.habitLogs.findIndex((log) => log.date === date);

  if (logIndex === -1) {
    return res.status(404).json({ message: "Habit log not found" });
  }

  // Remove the habit log entry from the database
  Database.habitLogs.splice(logIndex, 1);

  res.json({ message: `Habit log for ${date} deleted successfully` }); // Success response
});

// Export the router
export default router;
