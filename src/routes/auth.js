const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { validate } = require("../middleware");
const authController = require("../controllers/auth-controller");

// Route pour la connexion
router.post('/login',
  validate([
    body('email').isEmail().withMessage("L'email est requis et doit être valide"),
    body('password').notEmpty().withMessage("Le mot de passe est requis"),
  ]),
  authController.login
);

// Route pour la déconnexion
router.post('/logout', authController.logout);

// Route pour initier la réinitialisation du mot de passe
router.post("/forgot-password",
  validate([
    body('email').isEmail().withMessage("L'email est requis et doit être valide"),
  ]),
  authController.forgotPassword
);

// Route pour réinitialiser le mot de passe
router.post("/reset-password/:token",
  validate([
    body('newPassword').notEmpty().withMessage("Le nouveau mot de passe est requis"),
  ]),
  authController.resetPassword
);

module.exports = router;