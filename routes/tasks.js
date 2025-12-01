// routes/tasks.js
const express = require("express");
const Joi = require("joi");
const Task = require("../models/Task");
const logger = require("../logger");

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
    logger.error("Erreur GET /api/tasks:", { message: error.message, stack: error.stack });
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// POST nouvelle tâche
router.post("/", async (req, res) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body, { abortEarly: false });
    if (error) {
      logger.warn("Validation création tâche échouée", {
        errors: error.details.map((d) => d.message),
      });
      return res.status(400).json({
        error: "Données invalides.",
        details: error.details.map((d) => d.message),
      });
    }

    const task = await Task.create({
      title: value.title.trim(),
      user: req.user.id,
    });

    logger.info("Tâche créée", { taskId: task._id, userId: req.user.id });

    res.status(201).json(task);
  } catch (error) {
    logger.error("Erreur POST /api/tasks:", { message: error.message, stack: error.stack });
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// PUT modification
router.put("/:id", async (req, res) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body, { abortEarly: false });
    if (error) {
      logger.warn("Validation mise à jour tâche échouée", {
        errors: error.details.map((d) => d.message),
      });
      return res.status(400).json({
        error: "Données invalides.",
        details: error.details.map((d) => d.message),
      });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      logger.warn("Tâche non trouvée pour update", {
        taskId: req.params.id,
        userId: req.user.id,
      });
      return res.status(404).json({ error: "Tâche introuvable." });
    }

    if (value.title) task.title = value.title.trim();
    if (value.completed !== undefined) task.completed = value.completed;

    await task.save();

    logger.info("Tâche mise à jour", { taskId: task._id, userId: req.user.id });

    res.json(task);
  } catch (error) {
    logger.error("Erreur PUT /api/tasks/:id:", { message: error.message, stack: error.stack });
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
      logger.warn("Tâche non trouvée pour delete", {
        taskId: req.params.id,
        userId: req.user.id,
      });
      return res.status(404).json({ error: "Tâche introuvable." });
    }

    logger.info("Tâche supprimée", { taskId: task._id, userId: req.user.id });

    res.json({ message: "Tâche supprimée." });
  } catch (error) {
    logger.error("Erreur DELETE /api/tasks/:id:", { message: error.message, stack: error.stack });
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
