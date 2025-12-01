const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Joi = require("joi");
const User = require("../models/User");

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
      return res.status(400).json({
        error: "Données invalides.",
        details: error.details.map((d) => d.message),
      });
    }

    const { email, password, name } = value;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Cet email est déjà utilisé." });
    }

    const user = await User.create({ email, password, name });
    const token = generateToken(user);

    res.status(201).json({
      message: "Utilisateur créé avec succès.",
      user: { id: user._id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: "Données invalides.",
        details: error.details.map((d) => d.message),
      });
    }

    const { email, password } = value;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Identifiants invalides." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Identifiants invalides." });

    const token = generateToken(user);

    res.json({
      message: "Connexion réussie.",
      user: { id: user._id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
