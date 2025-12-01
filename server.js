require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./config/database");

// ROUTES
const authRoutes = require("./routes/auth");
const tasksRoutes = require("./routes/tasks");

// MIDDLEWARE
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connexion MongoDB Atlas
connectToDatabase();

app.get("/", (req, res) => {
  res.send("API OK + Auth + Tasks protégées 🚀");
});

// ---- ROUTES PUBLIQUES
app.use("/api/auth", authRoutes);

// ---- ROUTES PROTÉGÉES
app.use("/api/tasks", authMiddleware, tasksRoutes);

app.get("/api/me", authMiddleware, (req, res) => {
  res.json({ message: "Route protégée OK", user: req.user });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
