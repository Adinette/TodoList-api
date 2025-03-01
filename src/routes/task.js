const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const { validate } = require("../middleware");
const taskController = require("../controllers/task-controller");

// 🔹 Récupérer toutes les tâches
router.get("/", taskController.getAllTasks);

// 🔹 Récupérer une tâche par son ID
router.get(
  "/:id",
  validate([
    param("id").isInt().withMessage("L'ID doit être un nombre entier"),
  ]),
  taskController.getTaskById
);

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
  taskController.createTask
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
  taskController.updateTask
);

// 🔹 Mettre à jour le statut d'une tâche
router.put(
  "/statusTask/:id",
  validate([
    body("status").optional().isString().withMessage("Le status est requis"),
  ]),
  taskController.updateTaskStatus
);

// 🔹 Supprimer une tâche
router.delete(
  "/:id",
  validate([
    param("id").isInt().withMessage("L'ID doit être un nombre entier"),
  ]),
  taskController.deleteTask
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
  taskController.getTaskByIdAndStatus
);

module.exports = router;