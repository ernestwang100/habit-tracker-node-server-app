import Database from "../Database/index.js";
export default function HabitLogRoutes(app) {
    app.get("/api/habitlogs", (req, res) => {
        const logs = Database.habitLogs;
        res.send(logs);
    })
}