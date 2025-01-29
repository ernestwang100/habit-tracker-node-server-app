import Database from "../Database/index.js";

export default function HabitLogsRoutes(app) {

  // 1. Get all habit logs
  app.get("/api/habitlogs", (req, res) => {
    const habitLogs = Database.habitLogs;
    res.json(habitLogs);  // Return the habit log entries
  });

  // 2. Add a new habit log entry
  app.post("/api/habitlogs", (req, res) => {
    const { date, habitCompletions } = req.body;

    // Create a new habit log entry
    const newLog = {
      date,
      habitCompletions: habitCompletions || [], // habitCompletions should be an array of { habitId, completed }
      streakDays: 0,  // initial streak days, can be updated later
      allHabitsCompleted: habitCompletions.every(h => h.completed)  // check if all habits are completed
    };

    Database.habitLogs.push(newLog);
    res.status(201).json(newLog); // Respond with the newly created habit log entry
  });

  // 3. Update an existing habit log entry
  app.put("/api/habitlogs/:date", (req, res) => {
    const { date } = req.params;
    const { habitCompletions, streakDays, allHabitsCompleted } = req.body;

    // Find the habit log by date
    const logIndex = Database.habitLogs.findIndex((log) => log.date === date);

    if (logIndex === -1) {
      return res.status(404).json({ message: "Habit log not found" });
    }

    // Update the habit log entry
    const updatedLog = {
      ...Database.habitLogs[logIndex],
      habitCompletions: habitCompletions || Database.habitLogs[logIndex].habitCompletions,
      streakDays: streakDays !== undefined ? streakDays : Database.habitLogs[logIndex].streakDays,
      allHabitsCompleted: allHabitsCompleted !== undefined ? allHabitsCompleted : Database.habitLogs[logIndex].allHabitsCompleted
    };

    Database.habitLogs[logIndex] = updatedLog;

    res.json(updatedLog);  // Respond with the updated habit log entry
  });

  // 4. Delete a habit log entry by date
  app.delete("/api/habitlogs/:date", (req, res) => {
    const { date } = req.params;

    // Find the habit log by date
    const logIndex = Database.habitLogs.findIndex((log) => log.date === date);

    if (logIndex === -1) {
      return res.status(404).json({ message: "Habit log not found" });
    }

    // Remove the habit log entry from the database
    Database.habitLogs.splice(logIndex, 1);

    res.json({ message: `Habit log for ${date} deleted successfully` }); // Success response
  });
}
