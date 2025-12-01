require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// 📌 Connexion à MongoDB Atlas
connectToDatabase();

// Route test pour vérifier que le serveur fonctionne
app.get("/", (req, res) => {
  res.send("API OK + Connexion MongoDB Atlas testée 🚀");
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
