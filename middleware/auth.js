// middleware/auth.js
const jwt = require("jsonwebtoken");
const logger = require("../logger");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn("Token manquant sur une route protégée", {
        ip: req.ip,
        url: req.originalUrl,
      });
      return res.status(401).json({ error: "Token manquant." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      logger.warn("Format de token invalide", { header: authHeader });
      return res.status(401).json({ error: "Token invalide." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (error) {
    logger.warn("Erreur middleware auth (token invalide ou expiré)", {
      message: error.message,
    });
    return res.status(401).json({ error: "Token invalide ou expiré." });
  }
};
