const express = require("express");
const { body, param, validationResult } = require("express-validator");
const router = express.Router();
const connection = require("../connection");
const util = require("util");

const query = util.promisify(connection.query).bind(connection);

// Middleware pour gérer les erreurs de validation
const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Récupération de tous les statuts
router.get("/", async (req, res) => {
  try {
    const taskStatus = await query("SELECT * FROM taskstatus");
    res.json(taskStatus);
  } catch (err) {
    console.error("Erreur lors de la récupération des statuts:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Création d'un statut
router.post(
  "/",
  validate([body("status").notEmpty().withMessage("Le statut est requis")]),
  async (req, res) => {
    try {
      const { status } = req.body;
      const result = await query("INSERT INTO taskstatus (status) VALUES (?)", [status]);
      res.status(201).json({ message: "Statut ajouté avec succès", taskId: result.insertId });
    } catch (err) {
      console.error("Erreur lors de l'insertion du statut:", err);
      res.status(500).json({ error: "Erreur lors de l'insertion du statut" });
    }
  }
);

// Suppression d'un statut par ID
router.delete(
  "/:id",
  validate([param("id").isInt().withMessage("ID invalide")]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const results = await query("SELECT status FROM taskstatus WHERE id = ?", [id]);
      if (results.length === 0) return res.status(404).json({ error: "Statut non trouvé" });

      await query("UPDATE task SET status = NULL WHERE status = ?", [results[0].status]);
      const deleteResult = await query("DELETE FROM taskstatus WHERE id = ?", [id]);
      
      if (deleteResult.affectedRows === 0) return res.status(404).json({ error: "Statut non trouvé" });
      res.status(200).json({ message: "Statut supprimé avec succès" });
    } catch (err) {
      console.error("Erreur lors de la suppression du statut:", err);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
);

// Modification d'un statut par ID
router.put(
  "/:id",
  validate([
    param("id").isInt().withMessage("ID invalide"),
    body("status").notEmpty().withMessage("Le statut est requis"),
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const results = await query("SELECT status FROM taskstatus WHERE id = ?", [id]);
      if (results.length === 0) return res.status(404).json({ error: "Statut non trouvé" });

      await query("INSERT IGNORE INTO taskstatus (status) VALUES (?)", [status]);
      await query("UPDATE task SET status = ? WHERE status = ?", [status, results[0].status]);
      await query("DELETE FROM taskstatus WHERE status = ?", [results[0].status]);

      res.status(200).json({ message: "Statut mis à jour avec succès" });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
);

router.put(
  "/:id",
  validate([
    param("id").isInt().withMessage("L'ID doit être un nombre entier"),
    body("status").optional().isString().withMessage("Le status est requis"),
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {  status } = req.body;

      // Vérifier si la tâche existe
      const task = await query("SELECT * FROM task WHERE id = ?", [id]);
      if (task.length === 0) {
        return res.status(404).json({ error: "Tâche non trouvée" });
      }

      // Vérifier si le statut existe dans taskstatus
      const statusExists = await query("SELECT * FROM taskstatus WHERE status = ?", [status]);
      if (statusExists.length === 0) {
        return res.status(400).json({ error: "Le status fourni n'existe pas" });
      }

      // Mettre à jour la tâche
      await query(
        "UPDATE task SET status = ? WHERE id = ?",
        [ status, id]
      );
      res.json({ message: "Tâche mise à jour avec succès" });
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err.sqlMessage);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
);

// Récupération d'un statut par ID
router.get(
  "/:id",
  validate([param("id").isInt().withMessage("ID invalide")]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const results = await query("SELECT * FROM taskstatus WHERE id = ?", [id]);
      if (results.length === 0) return res.status(404).json({ error: "Statut non trouvé" });
      res.json(results[0]);
    } catch (err) {
      console.error("Erreur lors de la récupération du statut:", err);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
);

module.exports = router;
