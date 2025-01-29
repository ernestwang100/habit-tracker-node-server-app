import Database from "../Database/index.js";

export default function HabitRoutes(app) {

  // 1. Get all habits
  app.get("/api/habits", (req, res) => {
    const habits = Database.habits;
    res.json(habits);  // Respond with the habit list
  });

  // 2. Add a new habit
  app.post("/api/habits", (req, res) => {
    const { name, icon } = req.body;

    // Generate a new ID for the habit
    const newHabit = {
      id: Database.habits.length + 1,  // Simple way to create unique ID
      name,
      icon
    };

    // Add the new habit to the database
    Database.habits.push(newHabit);

    // Respond with the newly added habit
    res.status(201).json(newHabit);
  });

  // 3. Update an existing habit by ID
  app.put("/api/habits/:id", (req, res) => {
    const { id } = req.params;
    const { name, icon } = req.body;

    // Find the habit by ID
    const habitIndex = Database.habits.findIndex((habit) => habit.id === parseInt(id));

    if (habitIndex === -1) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Update the habit
    const updatedHabit = {
      ...Database.habits[habitIndex],
      name: name || Database.habits[habitIndex].name,
      icon: icon || Database.habits[habitIndex].icon
    };

    Database.habits[habitIndex] = updatedHabit;

    // Respond with the updated habit
    res.json(updatedHabit);
  });

  // 4. Delete a habit by ID
  app.delete("/api/habits/:id", (req, res) => {
    const { id } = req.params;

    // Find the habit by ID
    const habitIndex = Database.habits.findIndex((habit) => habit.id === parseInt(id));

    if (habitIndex === -1) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Remove the habit from the list
    Database.habits.splice(habitIndex, 1);

    // Respond with a success message
    res.json({ message: `Habit with ID ${id} deleted` });
  });

}
