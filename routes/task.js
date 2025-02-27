const express = require("express");
const router = express.Router();
const connection = require("../connection");


//requete de recuperation de toutes les taches
router.get('/', (req, res) => {
    connection.query("SELECT * FROM task", (err, rows, fields) => {
        if (err) {
            console.error("Erreur lors de la récupération des tâches:", err);
            res.status(500).json({ error: "Erreur lors de la récupération des tâches" });
            return;
        }
        res.json(rows);
    });
});

//requete de recuperation d'une tache par son id
router.get("/:id", (req, res) => {
  const taskId = parseInt (req.params.id, 10);
  connection.query("SELECT * FROM task WHERE id = ?", taskId ,(err, results, rows) => {
    if (err){
      console.error('Erreur SQL:', err);
      return res.status(500).json({ error: "Erreur lors de la récupération des tâches" });
    }
    if (results.length === 0){
      return res.status(404).json({ error: "Tache non trouvée" });
    }
    res.status(200).json({
      results
  });
});
});

// Création ou mise à jour d'une tâche
router.post("/", (req, res) => {
  const { id, title, description, status } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Les champs title, description et status sont requis" });
  }

  let taskStatus = status || "Todo"; // Si status est vide, utilise "Todo"

  // Vérifiez si le status existe dans la table taskstatus
  const statusQuery = "SELECT * FROM taskstatus WHERE status = ?";
  connection.query(statusQuery, [taskStatus], (err, results) => {
    if (err) {
      console.error("Erreur lors de la vérification du status:", err);
      return res.status(500).json({ error: "Erreur lors de la vérification du status" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Le status fourni n'existe pas" });
    }

    // Création d'une nouvelle tâche
    const insertQuery = "INSERT INTO task (title, description, status) VALUES (?, ?, ?)";
    connection.query(insertQuery, [title, description, taskStatus], (err, result) => {
      if (err) {
        console.error("Erreur lors de l'insertion :", err);
        return res.status(500).json({ error: "Erreur lors de l'insertion de la tâche" });
      }
      return res.status(201).json({ message: "Tâche ajoutée avec succès", taskId: result.insertId });
    });
  });
});

router.put("/:id", (req, res) => {
  const { title, description, status } = req.body;
  const taskId = req.params.id;

  if (!title || !description || !status) {
    return res.status(400).json({ error: "Les champs title, description et status sont requis" });
  }

  // Vérifier si la tâche existe
  connection.query("SELECT * FROM task WHERE id = ?", [taskId], (err, rows) => {
    if (err) {
      console.error("Erreur lors de la recherche de la tâche:", err.sqlMessage);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    // Vérifiez si le status existe dans la table taskstatus
    const statusQuery = "SELECT * FROM taskstatus WHERE status = ?";
    connection.query(statusQuery, [status], (err, results) => {
      if (err) {
        console.error("Erreur lors de la vérification du status:", err);
        return res.status(500).json({ error: "Erreur lors de la vérification du status" });
      }

      if (results.length === 0) {
        return res.status(400).json({ error: "Le status fourni n'existe pas" });
      }

      // Mise à jour de la tâche si le status est valide
      const updateQuery = "UPDATE task SET title = ?, description = ?, status = ? WHERE id = ?";
      connection.query(updateQuery, [title, description, status, taskId], (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour :", err);
          return res.status(500).json({ error: "Erreur lors de la mise à jour de la tâche" });
        }
        return res.status(200).json({ message: "Tâche mise à jour avec succès" });
      });
    });
  });
});


//requete de suppression de tache avec id
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const query = "DELETE FROM task WHERE id = ?";
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Erreur lors de la suppression de la tâche:", err);
            res.status(500).json({ error: "Erreur lors de la suppression de la tâche" });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: "Tâche non trouvée" });
            return;
        }
        res.status(200).json({ message: "Tâche supprimée avec succès" });
    });
});


//requete de recuperation d'une tache par son id et son status
router.get("/:id/:status", (req, res) => {
  const id = req.params.id;
  const status = req.params.status;
  res.status(200).json({
    id: id,
    status: status,
  });
});

module.exports = router;
