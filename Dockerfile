# Dockerfile - Backend Cloud Campus / ToDoApp

# 1. Image Node légère
FROM node:20-alpine

# 2. Dossier de travail dans le conteneur
WORKDIR /app

# 3. Copier uniquement les fichiers de dépendances en premier (pour le cache Docker)
COPY package*.json ./

# 4. Installer les dépendances
RUN npm install

# 5. Copier le reste du code (server.js, config/, routes/, etc.)
COPY . .

# 6. Exposer le port utilisé par ton serveur
EXPOSE 5000

# 7. Commande de démarrage
CMD ["node", "server.js"]
