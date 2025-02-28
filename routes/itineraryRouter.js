import express from "express";
import db from "../config/firebase-admin.js";  // Import Firestore instance

const router = express.Router();
const itineraryCollection = db.collection("itinerary");

// 1️⃣ Get all itinerary items for a specific user
router.get("/", async (req, res) => {
  const { userId } = req.query;  // Assuming userId is passed as a query parameter
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  
  try {
    const snapshot = await itineraryCollection.where("userId", "==", userId).get();
    const itineraryItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(itineraryItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch itinerary items", error });
  }
});

// 2️⃣ Add a new itinerary item
router.post("/", async (req, res) => {
  const { userId, name, description } = req.body;
  if (!userId || !name) {
    return res.status(400).json({ message: "User ID and name are required" });
  }
  
  try {
    const docRef = await itineraryCollection.add({ userId, name, description });
    res.status(201).json({ id: docRef.id, userId, name, description });
  } catch (error) {
    res.status(500).json({ message: "Failed to add itinerary item", error });
  }
});

// 3️⃣ Update an existing itinerary item by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  try {
    const itineraryDoc = itineraryCollection.doc(id);
    await itineraryDoc.update({ name, description });
    res.json({ id, name, description });
  } catch (error) {
    res.status(500).json({ message: "Failed to update itinerary item", error });
  }
});

// 4️⃣ Delete an itinerary item by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const itineraryDoc = itineraryCollection.doc(id);
    await itineraryDoc.delete();
    res.json({ message: `Itinerary item with ID ${id} deleted` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete itinerary item", error });
  }
});

export default router;
