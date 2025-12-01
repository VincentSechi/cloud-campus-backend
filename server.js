// server.js
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const connectToDatabase = require("./config/database");
const authRoutes = require("./routes/auth");
const tasksRoutes = require("./routes/tasks");
const authMiddleware = require("./middleware/auth");
const logger = require("./logger");

const app = express();
const PORT = process.env.PORT || 5000;

// Vérification des variables d'environnement essentielles
if (!process.env.JWT_SECRET) {
  logger.error("❌ JWT_SECRET manquant dans .env");
  process.exit(1);
}

// Sécurité HTTP (headers)
app.use(helmet());

// CORS sécurisé (front local ou prod)
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: false,
  })
);

// Logs HTTP avec Morgan + Winston
app.use(
  morgan("combined", {
    stream: logger.stream,
  })
);

// Parsing JSON
app.use(express.json());

// Connexion MongoDB Atlas
connectToDatabase();

// Healthcheck
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ----- ROUTES PUBLIQUES -----
app.use("/api/auth", authRoutes);

// ----- ROUTES PROTÉGÉES -----
app.use("/api/tasks", authMiddleware, tasksRoutes);

app.get("/api/me", authMiddleware, (req, res) => {
  res.json({ message: "Route protégée OK", user: req.user });
});

// 404
app.use((req, res) => {
  logger.warn("Route non trouvée", { method: req.method, url: req.originalUrl });
  res.status(404).json({ error: "Route non trouvée" });
});

// Gestion d’erreurs globale
app.use((err, req, res, next) => {
  logger.error("❌ Erreur serveur:", {
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({ error: "Erreur interne du serveur" });
});

app.listen(PORT, () => {
  logger.info(`🚀 Serveur backend sécurisé sur le port ${PORT}`);
  logger.info(`🌍 CORS autorise : ${allowedOrigin}`);
});
