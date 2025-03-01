const app = require("./src/app");
const connection = require("./src/connection");

const PORT = process.env.PORT || 5000;

// Vérifiez la connexion à la base de données avant de démarrer le serveur
connection.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données:" + err.stack);
    return;
  }
  console.log("Connexion à la base de données établie");

  // Démarrez le serveur uniquement si la connexion est réussie
  app.listen(PORT, () => {
    console.log(`Serveur est en ligne sur le port ${PORT}`);
  });
});