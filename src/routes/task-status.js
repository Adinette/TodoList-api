const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const { validate } = require("../middleware");
const taskStatusController = require("../controllers/task-status-controller");

// Récupérer tous les statuts
router.get("/", taskStatusController.getAllTaskStatus);

// Récupérer un statut par ID
router.get("/:id", taskStatusController.getTaskStatusById);

// Ajouter un nouveau statut
router.post(
  "/",
  validate([
    body("status").notEmpty().withMessage("Le statut est requis"),
  ]),
  taskStatusController.createTaskStatus
);

// Mettre à jour un statut par ID
router.put(
  "/:id",
  validate([
    param("id").isInt().withMessage("L'ID doit être un nombre entier"),
    body("status").optional().isString().withMessage("Le statut est requis"),
  ]),
  taskStatusController.updateTaskStatus
);

// Supprimer un statut par ID
router.delete(
  "/:id",
  validate([
    param("id").isInt().withMessage("L'ID doit être un nombre entier"),
  ]),
  taskStatusController.deleteTaskStatus
);

module.exports = router;