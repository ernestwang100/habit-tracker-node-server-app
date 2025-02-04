import express from "express";
import cors from "cors";
import habitLogRoutes from "./Habitron/habitLogs/routes.js";
import habitRoutes from "./Habitron/habits/routes.js";
const app = express();
app.use(cors());
// Add middleware to parse JSON body
app.use(express.json());  // This is the key line that ensures `req.body` is parsed

// Use the routes
app.use(habitLogRoutes);
app.use(habitRoutes);
// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});