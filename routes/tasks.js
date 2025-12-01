// routes/tasks.js

const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// GET /api/tasks -> liste les tâches de l'utilisateur connecté
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Erreur GET /api/tasks:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// POST /api/tasks -> crée une tâche pour l'utilisateur connecté
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Le champ 'title' est obligatoire." });
    }

    const task = await Task.create({
      title: title.trim(),
      user: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Erreur POST /api/tasks:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// PUT /api/tasks/:id -> met à jour une tâche de l'utilisateur connecté
router.put("/:id", async (req, res) => {
  try {
    const { title, completed } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ error: "Tâche introuvable." });
    }

    if (typeof title === "string") {
      task.title = title.trim();
    }
    if (typeof completed === "boolean") {
      task.completed = completed;
    }

    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Erreur PUT /api/tasks/:id:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// DELETE /api/tasks/:id -> supprime une tâche de l'utilisateur connecté
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ error: "Tâche introuvable." });
    }

    res.json({ message: "Tâche supprimée." });
  } catch (error) {
    console.error("Erreur DELETE /api/tasks/:id:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
