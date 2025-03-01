import express from "express";
import cors from "cors";
import habitLogRoutes from "./Habitron/habitLogs/routes.js";
import habitRoutes from "./Habitron/habits/routes.js";
import colorsRoutes from "./Habitron/colors/routes.js";
import usersRoutes from "./Habitron/users/routes.js";
import itineraryRouter from "./Habitron/routes/itineraryRouter.js"
import scheduleRouter from "./Habitron/routes/scheduleRouter.js"

const app = express();
app.use(cors());
// Add middleware to parse JSON body
app.use(express.json());  // This is the key line that ensures `req.body` is parsed

// Register routes with prefixes
app.use("/api/habitlogs", habitLogRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/colors", colorsRoutes);
app.use("/api/auth", usersRoutes);
app.use("/api/itinerary", itineraryRouter);
app.use("/api/schedule", scheduleRouter);

// Start the server
const PORT = process.env.PORT || 4000;  // Use environment port or fallback to 4000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});