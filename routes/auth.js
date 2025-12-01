// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Joi = require("joi");
const User = require("../models/User");
const logger = require("../logger");

const router = express.Router();

// Limite brute-force → max 10 tentatives / 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives, réessayez plus tard." },
});

router.use(authLimiter);

// JOI schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().min(2).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

// Génération JWT
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      logger.warn("Validation register échouée", {
        errors: error.details.map((d) => d.message),
      });
      return res.status(400).json({
        error: "Données invalides.",
        details: error.details.map((d) => d.message),
      });
    }

    const { email, password, name } = value;

    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn("Tentative d'inscription avec email déjà utilisé", { email });
      return res.status(409).json({ error: "Cet email est déjà utilisé." });
    }

    const user = await User.create({ email, password, name });
    const token = generateToken(user);

    logger.info("Nouvel utilisateur inscrit", { userId: user._id, email: user.email });

    res.status(201).json({
      message: "Utilisateur créé avec succès.",
      user: { id: user._id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    logger.error("Erreur register:", { message: error.message, stack: error.stack });
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      logger.warn("Validation login échouée", {
        errors: error.details.map((d) => d.message),
      });
      return res.status(400).json({
        error: "Données invalides.",
        details: error.details.map((d) => d.message),
      });
    }

    const { email, password } = value;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Login avec email inconnu", { email });
      return res.status(401).json({ error: "Identifiants invalides." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn("Login avec mauvais mot de passe", { email });
      return res.status(401).json({ error: "Identifiants invalides." });
    }

    const token = generateToken(user);

    logger.info("Utilisateur connecté", { userId: user._id, email: user.email });

    res.json({
      message: "Connexion réussie.",
      user: { id: user._id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    logger.error("Erreur login:", { message: error.message, stack: error.stack });
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
