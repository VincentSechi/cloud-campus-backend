// config/database.js

const mongoose = require("mongoose");

async function connectToDatabase() {
  try {
    const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DBNAME}?retryWrites=true&w=majority&appName=toDoApp`;

    console.log("🔄 Connexion à MongoDB Atlas en cours...");

    // ✨ Plus besoin de useNewUrlParser / useUnifiedTopology avec les versions récentes
    await mongoose.connect(uri);

    console.log("✅ Connecté à MongoDB Atlas !");
  } catch (error) {
    console.error("❌ Erreur de connexion à MongoDB :", error.message);
    process.exit(1);
  }
}

module.exports = connectToDatabase;
