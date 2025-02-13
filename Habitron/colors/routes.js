import express from "express";
import db from "../config/firebase-admin.js"; // Firestore instance

const router = express.Router();
const colorsCollection = db.collection("colors");

// ✅ 1. Get all colors
router.get("/", async (req, res) => {
  try {
    const snapshot = await colorsCollection.get();
    const colors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch colors", error });
  }
});

// ✅ 2. Add or update a user's color palette
router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { colors } = req.body;

  if (!Array.isArray(colors) || colors.some(color => typeof color !== "string")) {
    return res.status(400).json({ message: "Invalid colors format" });
  }

  try {
    const userColorDoc = colorsCollection.doc(userId);
    await userColorDoc.set({ colors }, { merge: true });

    res.json({ message: "Colors updated successfully", colors });
  } catch (error) {
    res.status(500).json({ message: "Failed to update colors", error });
  }
});

// ✅ 3. Delete a user's color palette
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userColorDoc = colorsCollection.doc(userId);
    const snapshot = await userColorDoc.get();

    if (!snapshot.exists) {
      return res.status(404).json({ message: "Color settings not found" });
    }

    await userColorDoc.delete();
    res.json({ message: `Color settings for user ${userId} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete color settings", error });
  }
});

export default router;
