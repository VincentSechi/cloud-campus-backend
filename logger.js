// logger.js
const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    // Log dans la console (utile pour docker logs)
    new transports.Console(),
    // Log dans un fichier à l'intérieur du conteneur
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/app.log" }),
  ],
});

// Pour Morgan (HTTP logger)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
