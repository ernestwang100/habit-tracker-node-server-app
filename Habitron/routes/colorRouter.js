import { Router } from "express";

const router = Router();

// Initial set of default colors
let colors = ["#3498db", "#e74c3c", "#f1c40f", "#2ecc71", "#9b59b6"];

// Route to get colors
router.get("/colors", (req, res) => {
  try {
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch colors", error: error.message });
  }
});

// Route to update colors
router.put("/colors", (req, res) => {
  const { colors: updatedColors } = req.body;

  if (!Array.isArray(updatedColors) || !updatedColors.every(color => typeof color === 'string')) {
    return res.status(400).json({ message: "Invalid colors format" });
  }

  colors = updatedColors;
  res.json(colors);
});

export default router;
