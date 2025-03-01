const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const users = await User.getById(id);
    if (users.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(users[0]);
  } catch (err) {
    console.error("Erreur lors de la récupération de l'utilisateur:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Les champs username, email et password sont requis" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.create(username, email, hashedPassword);
    res.status(201).json({ message: "Utilisateur créé avec succès", userId: result.insertId });
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur:", err);
    res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  registerUser,
};