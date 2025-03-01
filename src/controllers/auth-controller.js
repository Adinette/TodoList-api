const { auth } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
let tokenBlacklist = new Set();

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await auth.getByEmail(email);
    if (users.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ message: "Connexion réussie", token });
  } catch (err) {
    console.error("Erreur lors de la récupération de l'utilisateur:", err);
    res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
};

const logout = (req, res) => {
  const token = req?.headers?.authorization?.split(' ')[1];
  tokenBlacklist.add(token);
  res.status(200).json({ message: "Déconnexion réussie" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const users = await auth.getByEmail(email);
    if (users.length === 0) {
      return res.status(400).send("Aucun utilisateur trouvé avec cet email.");
    }

    // Génération du token
    const token = crypto.randomBytes(32).toString("hex");
    const expiration = Date.now() + 3600000; // 1 heure

    // Mise à jour en base de données
    await auth.updateResetToken(email, token, expiration);

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
  } catch (err) {
    console.error("Erreur SQL :", err);
    return res.status(500).send("Erreur du serveur.");
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const users = await auth.getByResetToken(token);
    if (users.length === 0) {
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await auth.updatePassword(users[0].id, hashedPassword);
    await auth.clearResetToken(token);

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", err);
    res.status(500).json({ message: "Erreur du serveur." });
  }
};

// Middleware pour vérifier les tokens blacklistés
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: "Token invalide" });
  }
  next();
};

module.exports = {
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyToken,
};