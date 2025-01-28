import express from "express";
import cors from "cors";
import HabitLogRoutes from "./Habitron/dailyHabitLogs/routes";
import HabitRoutes from "./Habitron/habits/routes";
const app = express();
app.use(cors());
HabitLogRoutes(app);
HabitRoutes(app);
app.listen(4000);