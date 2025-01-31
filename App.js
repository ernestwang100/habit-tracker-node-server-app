import express from "express";
import cors from "cors";
import HabitLogRoutes from "./Habitron/habitLogs/routes.js";
import HabitRoutes from "./Habitron/habits/routes.js";
const app = express();
app.use(cors());
// Add middleware to parse JSON body
app.use(express.json());  // This is the key line that ensures `req.body` is parsed
HabitLogRoutes(app);
HabitRoutes(app);
// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});