import express from "express";
import cors from "cors";
import HabitLogRoutes from "./Habitron/habitLogs/routes.js";
import HabitRoutes from "./Habitron/habits/routes.js";
const app = express();
app.use(cors());
HabitLogRoutes(app);
HabitRoutes(app);
app.listen(4000);