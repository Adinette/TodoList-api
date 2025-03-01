const express = require("express");
const router = express.Router();
const { validate } = require("../middleware");
const { body } = require("express-validator");
const userController = require("../controllers/user-controller");

// Récupérer tous les utilisateurs
router.get("/", userController.getAllUsers);

// Récupérer un utilisateur par ID
router.get("/:id", userController.getUserById);

// Route pour la création de compte
router.post('/register',
  validate([
    body('username').notEmpty().withMessage("Le nom d'utilisateur est requis"),
    body('email').isEmail().withMessage("L'email est requis et doit être valide"),
    body('password').notEmpty().withMessage("Le mot de passe est requis"),
  ]),
  userController.registerUser
);

module.exports = router;