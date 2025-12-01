const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Token manquant." });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token invalide." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (error) {
    console.error("Erreur middleware auth:", error);
    return res.status(401).json({ error: "Token invalide ou expiré." });
  }
};
