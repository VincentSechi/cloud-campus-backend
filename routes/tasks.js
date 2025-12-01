const express = require("express");
const Joi = require("joi");
const Task = require("../models/Task");

const router = express.Router();

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  completed: Joi.boolean().optional(),
});

// GET toutes les tâches du user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Erreur GET /api/tasks:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// POST nouvelle tâche
router.post("/", async (req, res) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: "Données invalides.",
        details: error.details.map((d) => d.message),
      });
    }

    const task = await Task.create({
      title: value.title.trim(),
      user: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Erreur POST /api/tasks:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// PUT modification
router.put("/:id", async (req, res) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: "Données invalides.",
        details: error.details.map((d) => d.message),
      });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ error: "Tâche introuvable." });

    if (value.title) task.title = value.title.trim();
    if (value.completed !== undefined) task.completed = value.completed;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Erreur PUT /api/tasks/:id:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// DELETE une tâche
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
