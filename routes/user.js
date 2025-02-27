const express = require("express");
const router = express.Router();
const connection = require("../connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  connection.query("SELECT * FROM user", (err, rows, fields) => {
    if (err) throw err;
    res.json(rows);
  });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    "SELECT * FROM user WHERE id = ?",
    [id],
    (err, rows, fields) => {
      if (err) {
        console.error("Erreur lors de la récupération de l'utilisateur:", err);
        res
          .status(500)
          .json({ error: "Erreur lors de la récupération de l'utilisateur" });
        return;
      }
      if (rows.length === 0) {
        res.status(404).json({ error: "Utilisateur non trouvé" });
        return;
      }
      res.json(rows[0]);
    }
  );
});

// Route pour la création de compte
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ error: "Les champs username, email et password sont requis" });
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO user (username, email, password) VALUES (?, ?, ?)";
        connection.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error("Erreur lors de la création de l'utilisateur:", err);
                res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
                return;
            }
            res.status(201).json({ message: "Utilisateur créé avec succès", userId: result.insertId });
        });
    } catch (err) {
        console.error("Erreur lors du hachage du mot de passe:", err);
        res.status(500).json({ error: "Erreur lors du hachage du mot de passe" });
    }
});


module.exports = router;
