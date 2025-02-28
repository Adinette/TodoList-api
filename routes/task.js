const express = require("express");
const { body, param, validationResult } = require("express-validator");
const router = express.Router();
const connection = require("../connection");
const util = require("util");

// Convertir les requêtes en version async/await
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

// 🔹 Récupérer toutes les tâches
router.get("/", async (req, res) => {
  try {
    const tasks = await query("SELECT * FROM task");
    res.json(tasks);
  } catch (err) {
    console.error("Erreur lors de la récupération des tâches:", err.sqlMessage);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// 🔹 Récupérer une tâche par son ID
router.get(
  "/:id",
  validate([
    param("id").isInt().withMessage("L'ID doit être un nombre entier"),
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const tasks = await query("SELECT * FROM task WHERE id = ?", [id]);
      if (tasks.length === 0) {
        return res.status(404).json({ error: "Tâche non trouvée" });
      }
      res.json(tasks[0]);
    } catch (err) {
      console.error("Erreur SQL:", err.sqlMessage);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
);

// ...existing code...

// Fonction pour convertir les dates en format compatible avec MySQL
const formatDateForMySQL = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

// 🔹 Ajouter une nouvelle tâche
router.post(
  "/",
  validate([
    body("title").notEmpty().isString().withMessage("Le titre est requis"),
    body("description").notEmpty().isString().withMessage("La description est requise"),
    body("status").optional().isString().withMessage("Le status doit être une chaîne de caractères"),
    body("startDate").optional().isISO8601().withMessage("La date de début doit être une date valide"),
    body("endDate").optional().isISO8601().withMessage("La date de fin doit être une date valide"),
  ]),
  async (req, res) => {
    try {
      const { title, description, status = "En cours", startDate, endDate } = req.body;

      // Vérifier si le statut existe dans taskstatus
      const statusExists = await query("SELECT * FROM taskstatus WHERE status = ?", [status]);
      if (statusExists.length === 0) {
        return res.status(400).json({ error: "Le status fourni n'existe pas" });
      }

      // Convertir les dates en format compatible avec MySQL
      const formattedStartDate = formatDateForMySQL(startDate);
      const formattedEndDate = formatDateForMySQL(endDate);

      // Insérer la tâche
      const result = await query(
        "INSERT INTO task (title, description, status, startDate, endDate) VALUES (?, ?, ?, ?, ?)",
        [title, description, status, formattedStartDate, formattedEndDate]
      );
      res.status(201).json({ message: "Tâche ajoutée avec succès", taskId: result.insertId });
    } catch (err) {
      console.error("Erreur lors de l'insertion:", err.sqlMessage);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
);

// 🔹 Mettre à jour une tâche
router.put(
  "/:id",
  validate([
    param("id").isInt().withMessage("L'ID doit être un nombre entier"),
    body("title").optional().isString().withMessage("Le titre est requis"),
    body("description").optional().isString().withMessage("La description est requise"),
    body("status").optional().isString().withMessage("Le status est requis"),
    body("startDate").optional().isISO8601().withMessage("La date de début doit être une date valide"),
    body("endDate").optional().isISO8601().withMessage("La date de fin doit être une date valide"),
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, status, startDate, endDate } = req.body;

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

      // Convertir les dates en format compatible avec MySQL
      const formattedStartDate = formatDateForMySQL(startDate);
      const formattedEndDate = formatDateForMySQL(endDate);

      // Mettre à jour la tâche
      await query(
        "UPDATE task SET title = ?, description = ?, status = ?, startDate = ?, endDate = ? WHERE id = ?",
        [title, description, status, formattedStartDate, formattedEndDate, id]
      );
      res.json({ message: "Tâche mise à jour avec succès" });
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err.sqlMessage);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
);

// ...existing code...

// 🔹 Supprimer une tâche
router.delete(
  "/:id",
  validate([
    param("id").isInt().withMessage("L'ID doit être un nombre entier"),
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await query("DELETE FROM task WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Tâche non trouvée" });
      }
      res.json({ message: "Tâche supprimée avec succès" });
    } catch (err) {
      console.error("Erreur lors de la suppression:", err.sqlMessage);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
);

// 🔹 Récupérer une tâche par ID et status
router.get(
  "/:id/:status",
  validate([
    param("id").isInt().withMessage("L'ID doit être un nombre entier"),
    param("status")
      .isString()
      .withMessage("Le status doit être une chaîne de caractères"),
  ]),
  async (req, res) => {
    try {
      const { id, status } = req.params;
      const task = await query(
        "SELECT * FROM task WHERE id = ? AND status = ?",
        [id, status]
      );

      if (task.length === 0) {
        return res
          .status(404)
          .json({ error: "Aucune tâche trouvée avec cet ID et status" });
      }
      res.json(task[0]);
    } catch (err) {
      console.error("Erreur lors de la récupération:", err.sqlMessage);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
);

module.exports = router;
