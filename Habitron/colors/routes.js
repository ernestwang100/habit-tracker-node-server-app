import express from "express";
import db from "../config/firebase-admin.js"; // Firestore instance

const router = express.Router();
const colorsCollection = db.collection("colors");

// ✅ 1. Get colors for a specific user (or all if no id is provided)
router.get("/", async (req, res) => {
  const { id } = req.query;

  try {
    if (id) {
      const userColorDoc = colorsCollection.doc(id);
      const snapshot = await userColorDoc.get();

      if (!snapshot.exists) {
        return res.status(404).json({ message: "No colors found for this user" });
      }

      return res.json({ id: snapshot.id, ...snapshot.data() });
    }

    // If no id is provided, return all color palettes
    const snapshot = await colorsCollection.get();
    const colors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch colors", error: error.message });
  }
});

// ✅ 2. Add or update a user's color palette (Requires id)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { colors } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  if (!Array.isArray(colors) || colors.some(color => typeof color !== "string")) {
    return res.status(400).json({ message: "Invalid colors format, must be an array of strings" });
  }

  try {
    const userColorDoc = colorsCollection.doc(id);
    await userColorDoc.set({ colors }, { merge: true });

    res.json({ message: "Colors updated successfully", id, colors });
  } catch (error) {
    res.status(500).json({ message: "Failed to update colors", error: error.message });
  }
});

// ✅ 3. Delete a user's color palette (Requires id)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  try {
    const userColorDoc = colorsCollection.doc(id);
    const snapshot = await userColorDoc.get();

    if (!snapshot.exists) {
      return res.status(404).json({ message: "Color settings not found" });
    }

    await userColorDoc.delete();
    res.json({ message: `Color settings for user ${id} deleted successfully`, id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete color settings", error: error.message });
  }
});

export default router;
