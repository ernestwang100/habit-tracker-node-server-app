import Database from "../Database";
export default function HabitLogRoutes(app) {
    app.get("/api/habitlogs", (req, res) => {
        const logs = Database.dailyHabitLogs;
        res.send(logs);
    })
}