// config/database.js
const mongoose = require("mongoose");
const logger = require("../logger");

const connectToDatabase = async () => {
  try {
    logger.info("🔄 Connexion à MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("✅ Connecté à MongoDB Atlas !");
  } catch (error) {
    logger.error("❌ Erreur connexion MongoDB :", { message: error.message, stack: error.stack });
    process.exit(1);
  }
};

module.exports = connectToDatabase;
