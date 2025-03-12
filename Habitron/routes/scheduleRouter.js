
import express from "express";
import db from "../config/firebase-admin.js";  // Import Firestore instance

const router = express.Router();
const scheduleCollection = db.collection("schedule");

// 1️⃣ Get all schedule slots for a specific user
router.get("/", async (req, res) => {
  const { userId } = req.query;  // Assuming userId is passed as a query parameter
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  
  try {
    const snapshot = await scheduleCollection.where("userId", "==", userId).get();
    const scheduleSlots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(scheduleSlots);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch schedule slots", error });
  }
});

// 2️⃣ Update a schedule slot
router.put("/", async (req, res) => {
  const { userId, slot, itineraryItemId } = req.body;
  if (!userId || !slot || !itineraryItemId) {
    return res.status(400).json({ message: "User ID, slot, and itinerary item ID are required" });
  }

  try {
    // Check if the slot already exists for the user
    const snapshot = await scheduleCollection.where("userId", "==", userId).where("slot", "==", slot).get();
    if (!snapshot.empty) {
      const scheduleDoc = snapshot.docs[0];
      await scheduleDoc.ref.update({ itineraryItemId });
      res.json({ slot, itineraryItemId });
    } else {
      // Add new schedule slot if it doesn't exist
      const docRef = await scheduleCollection.add({ userId, slot, itineraryItemId });
      res.status(201).json({ id: docRef.id, userId, slot, itineraryItemId });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update schedule slot", error });
  }
});

// 3️⃣ Remove a schedule slot
router.delete("/", async (req, res) => {
  const { userId, slot } = req.query;
  if (!userId || !slot) {
    return res.status(400).json({ message: "User ID and slot are required" });
  }
  
  try {
    const snapshot = await scheduleCollection.where("userId", "==", userId).where("slot", "==", slot).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: "Schedule slot not found" });
    }
    
    const scheduleDoc = snapshot.docs[0];
    await scheduleDoc.ref.delete();
    res.json({ message: `Schedule slot for ${slot} deleted` });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove schedule slot", error });
  }
});

// 4️⃣ Update schedule preferences (startTime, interval, weekStart)
router.put("/preferences", async (req, res) => {
  const { userId, startTime, interval, weekStart } = req.body;

  if (!userId || !startTime || !interval || !weekStart) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if preferences already exist for the user
    const snapshot = await scheduleCollection.where("userId", "==", userId).get();
    if (!snapshot.empty) {
      const preferencesDoc = snapshot.docs[0];
      await preferencesDoc.ref.update({ startTime, interval, weekStart });
      res.json({ userId, startTime, interval, weekStart });
    } else {
      // Add new preferences if they don't exist
      const docRef = await scheduleCollection.add({ userId, startTime, interval, weekStart });
      res.status(201).json({ id: docRef.id, userId, startTime, interval, weekStart });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update schedule preferences", error });
  }
});

export default router;
