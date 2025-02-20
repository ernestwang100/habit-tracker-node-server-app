import express from "express";
import db from "../config/firebase-admin.js";  // Import firestone instance

const router = express.Router();
const habitLogsCollection = db.collection("habitLogs");

// 1. Get all habit logs
router.get("/", async (req, res) => {
  const { userId } = req.query; // Get userId from query parameters
  console.log(`userId: ${userId}`);

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    const snapshot = await habitLogsCollection.where("userId", "==", userId).get();
    const habitLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(habitLogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch habit logs", error });
  }
});


// 2. Add a new habit log entry
router.post("/", async (req, res) => {
  const { userId, date, habitCompletions } = req.body;

  if (!userId || !date) {
    return res.status(400).json({ message: "Missing required fields: userId, date" });
  }

  try {
    const newLogRef = await habitLogsCollection.add({
      userId, // Store userId
      date,
      habitCompletions: habitCompletions || [],
      streakDays: 0,
      allHabitsCompleted: habitCompletions.every(h => h.completed),
    });

    res.status(201).json({ id: newLogRef.id, userId, date, habitCompletions });
  } catch (error) {
    res.status(500).json({ message: "Failed to add habit log", error });
  }
});


router.put("/batchUpdate", async (req, res) => {
  console.log("🔥 Received batch update request");  // Log when this endpoint is hit

  const { userId, updatedLogs } = req.body;  // Extract userId and logs

  console.log("📋 Data received:", JSON.stringify(updatedLogs, null, 2)); // Log incoming data

  if (!userId || !Array.isArray(updatedLogs) || updatedLogs.length === 0) {
    console.log("❌ Invalid request data");
    return res.status(400).json({ message: "Invalid request data or missing userId" });
  }

  try {
    const batch = db.batch();  // Create a Firestore batch

    for (const log of updatedLogs) {
      console.log(`📝 Checking log ID: ${log.id}`); // Log each log being processed
      const logRef = habitLogsCollection.doc(log.id);
      const logSnapshot = await logRef.get();

      if (!logSnapshot.exists) {
        console.log(`❌ Log ID ${log.id} not found, skipping.`);
        continue;
      }

      const logData = logSnapshot.data();
      if (logData.userId !== userId) {
        console.log(`🚫 Unauthorized update attempt on log ID: ${log.id}`);
        return res.status(403).json({ message: "Unauthorized to update this habit log" });
      }

      console.log(`✅ Updating log ID: ${log.id}`); // Log each valid update
      batch.update(logRef, {
        habitCompletions: log.habitCompletions,
      });
    }

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
  const { userId, date, habitCompletions, streakDays, allHabitsCompleted } = req.body;
  
  console.log("🔍 Checking habit log with ID:", id);
  console.log("📥 Received request body:", req.body);

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    const logDoc = habitLogsCollection.doc(id);
    const logSnapshot = await logDoc.get();

    if (!logSnapshot.exists) {
      return res.status(404).json({ message: "Habit log not found" });
    }

    if (logSnapshot.data().userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const logData = logSnapshot.data();
    console.log("📌 Retrieved log data:", logData);

    await logDoc.update({ date, habitCompletions, streakDays, allHabitsCompleted });
    console.log("✅ Update successful!");
    res.json({ id, date, habitCompletions, streakDays, allHabitsCompleted });
  } catch (error) {
    console.error("❌ Firestore update error:", error);
    res.status(500).json({ message: "Failed to update habit log", error });
  }
});


// 4. Delete a habit log entry by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    const logDoc = habitLogsCollection.doc(id);
    const logSnapshot = await logDoc.get();

    if (!logSnapshot.exists) {
      return res.status(404).json({ message: "Habit log not found" });
    }

    if (logSnapshot.data().userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await logDoc.delete();

    console.log(`🗑️ Delete ${id} successful!`);

    res.json({ message: `Habit log for ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete habit log", error });
  }
});



export default router;
