const express = require("express");
const router = express.Router();
const connection = require("../connection");

//requete de recuperation de toutes les taches
router.get("/", (req, res) => {
  connection.query("SELECT * FROM taskstatus", (err, rows, fields) => {
    if (err) {
      console.error("Erreur lors de la récupération des tâches:", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des tâches" });
      return;
    }
    res.json(rows);
  });
});

//requete de creation de tache
router.post("/", (req, res) => {
  const { status } = req.body;
  const query = `INSERT INTO taskstatus (status) VALUES (?)`;
  connection.query(query, [status], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion du status:", err);
      res.status(500).json({ error: "Erreur lors de l'insertion du status" });
      return;
    }
    res
      .status(201)
      .json({ message: "Status ajoutée avec succès", taskId: result.insertId });
  });
});

//Requete de suppression de tache avec id
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  // Vérifiez si le status existe dans taskstatus
  const checkStatusQuery = "SELECT status FROM taskstatus WHERE id = ?";
  connection.query(checkStatusQuery, [id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la vérification du status:", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la vérification du status" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: "Status non trouvé" });
      return;
    }

    const status = results[0].status;

    // Mettez à jour les lignes dans task qui référencent ce status
    const updateTaskQuery = "UPDATE task SET status = NULL WHERE status = ?";
    connection.query(updateTaskQuery, [status], (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour des tâches:", err);
        res
          .status(500)
          .json({ error: "Erreur lors de la mise à jour des tâches" });
        return;
      }

      // Supprimez le status de taskstatus
      const deleteStatusQuery = "DELETE FROM taskstatus WHERE id = ?";
      connection.query(deleteStatusQuery, [id], (err, result) => {
        if (err) {
          console.error("Erreur lors de la suppression du status:", err);
          res
            .status(500)
            .json({ error: "Erreur lors de la suppression du status" });
          return;
        }

        if (result.affectedRows === 0) {
          res.status(404).json({ error: "Status non trouvé" });
          return;
        }

        res.status(200).json({ message: "Status supprimé avec succès" });
      });
    });
  });
});

//requete de modification de tache avec id
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  // Vérifiez si le status existe dans taskstatus
  const checkStatusQuery = "SELECT status FROM taskstatus WHERE id = ?";
  connection.query(checkStatusQuery, [id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la vérification du status:", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la vérification du status" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: "Status non trouvé" });
      return;
    }

    const oldStatus = results[0].status;

    // Insérez le nouveau status dans taskstatus s'il n'existe pas déjà
    const insertStatusQuery =
      "INSERT IGNORE INTO taskstatus (status) VALUES (?)";
    connection.query(insertStatusQuery, [status], (err, result) => {
      if (err) {
        console.error("Erreur lors de l'insertion du nouveau status:", err);
        res
          .status(500)
          .json({ error: "Erreur lors de l'insertion du nouveau status" });
        return;
      }

      // Mettez à jour les lignes dans task qui référencent l'ancien status
      const updateTaskQuery = "UPDATE task SET status = ? WHERE status = ?";
      connection.query(updateTaskQuery, [status, oldStatus], (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour des tâches:", err);
          res
            .status(500)
            .json({ error: "Erreur lors de la mise à jour des tâches" });
          return;
        }

        // Supprimez l'ancien status de taskstatus
        const deleteOldStatusQuery = "DELETE FROM taskstatus WHERE status = ?";
        connection.query(deleteOldStatusQuery, [oldStatus], (err, result) => {
          if (err) {
            console.error(
              "Erreur lors de la suppression de l'ancien status:",
              err
            );
            res.status(500).json({
              error: "Erreur lors de la suppression de l'ancien status",
            });
            return;
          }

          res.status(200).json({ message: "Status mis à jour avec succès" });
        });
      });
    });
  });
});

//requete de recuperation d'une tache par son id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  res.status(200).json({
    id: id,
  });
});

module.exports = router;
