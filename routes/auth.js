const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Un utilisateur avec cet email existe déjà." });
    }

    const user = await User.create({ email, password, name });
    const token = generateToken(user);

    res.status(201).json({
      message: "Utilisateur créé avec succès.",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe sont obligatoires." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants invalides." });
    }

    const token = generateToken(user);

    res.json({
      message: "Connexion réussie.",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
