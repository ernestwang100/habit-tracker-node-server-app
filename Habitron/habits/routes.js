import Database from "../Database/index.js";
export default function HabitRoutes(app) {
    app.get("/api/habits", (req, res) => {
        const habits = Database.habits;
        res.send(habits);
    })
}