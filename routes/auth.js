const express = require("express");
const router = express.Router();
const connection = require("../connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
let tokenBlacklist = new Set();

// Route pour la connexion
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Les champs email et password sont requis" });
        return;
    }

    const query = "SELECT * FROM user WHERE email = ?";
    connection.query(query, [email], async (err, rows, fields) => {
        if (err) {
            console.error("Erreur lors de la récupération de l'utilisateur:", err);
            res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
            return;
        }
        if (rows.length === 0) {
            res.status(404).json({ error: "Utilisateur non trouvé" });
            return;
        }

        const user = rows[0];
               const match = await bcrypt.compare(password, user.password);
        if (!match) {
            res.status(401).json({ error: "Mot de passe incorrect" });
            return;
        }

        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ message: "Connexion réussie", token });
    });
});

// Route pour la déconnexion
router.post('/logout', (req, res) => {
    const token = req?.headers?.authorization?.split(' ')[1];
    tokenBlacklist.add(token);
    res.status(200).json({ message: "Déconnexion réussie" });
});

// Route pour initier la réinitialisation du mot de passe
router.post("/forgot-password", (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).send("L'email est requis.");
    }
  
    connection.query("SELECT * FROM user WHERE email = ?", [email], (err, result) => {
      if (err) {
        console.error("Erreur SQL :", err);
        return res.status(500).send("Erreur du serveur.");
      }
  
      if (result.length === 0) {
        return res.status(400).send("Aucun utilisateur trouvé avec cet email.");
      }
  
      // Génération du token
      const token = crypto.randomBytes(32).toString("hex");
      const expiration = Date.now() + 3600000; // 1 heure
  
      // Mise à jour en base de données
      connection.query(
        "UPDATE user SET reset_token = ?, reset_token_expiration = ? WHERE email = ?",
        [token, expiration, email],
        (err) => {
          if (err) {
            console.error("Erreur SQL (Update Token) :", err);
            return res.status(500).send("Erreur lors de l'enregistrement du token.");
          }
  
          // Lien de réinitialisation
          const resetLink = `http://localhost:5173/reset-password/${token}`;
  
          // Transporteur Nodemailer avec MailDev
          const transporter = nodemailer.createTransport({
            host: "localhost",
            port: 1025,
            secure: false,
          });
  
          // Contenu de l'email
          const mailOptions = {
            from: "no-reply@monapp.com",
            to: email,
            subject: "Réinitialisation de votre mot de passe",
            text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`,
          };
  
          // Envoi de l'email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Erreur lors de l'envoi de l'e-mail :", error);
              return res.status(500).send("Erreur lors de l'envoi de l'email.");
            }
  
            console.log("E-mail envoyé :", info.response);
            res.status(200).send("Un email de réinitialisation a été envoyé.");
          });
        }
      );
    });
  });

// Route pour réinitialiser le mot de passe
router.post("/reset-password/:token", (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Vérifie que newPassword n'est pas vide
    if (!newPassword) {
        return res.status(400).json({ message: "Le nouveau mot de passe est requis." });
    }

    connection.query(
        "SELECT * FROM user WHERE reset_token = ? AND reset_token_expiration > ?",
        [token, Date.now()],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Erreur du serveur." });
            if (result.length === 0) {
                return res.status(400).json({ message: "Token invalide ou expiré." });
            }

            const bcrypt = require("bcrypt");
            bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                if (err) {
                    console.error("Erreur de hachage du mot de passe:", err);
                    return res.status(500).json({ message: "Erreur lors du hachage du mot de passe." });
                }

                connection.query(
                    "UPDATE user SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = ?",
                    [hashedPassword, token],
                    (err) => {
                        if (err) return res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe." });
                        res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
                    }
                );
            });
        }
    );
});


// Middleware pour vérifier les tokens blacklistés
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ error: "Token invalide" });
    }
    next();
};


module.exports = router;