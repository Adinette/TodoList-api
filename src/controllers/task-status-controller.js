const { TaskStatus } = require("../models");

const getAllTaskStatus = async (req, res) => {
  try {
    const taskStatus = await TaskStatus.getAll();
    res.json(taskStatus);
  } catch (err) {
    console.error("Erreur lors de la récupération des statuts:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const getTaskStatusById = async (req, res) => {
  const { id } = req.params;
  try {
    const taskStatus = await TaskStatus.getById(id);
    if (taskStatus.length === 0) {
      return res.status(404).json({ error: "Statut non trouvé" });
    }
    res.json(taskStatus[0]);
  } catch (err) {
    console.error("Erreur lors de la récupération du statut:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const createTaskStatus = async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Le statut est requis" });
  }

  try {
    const result = await TaskStatus.create(status);
    res.status(201).json({ message: "Statut ajouté avec succès", taskStatusId: result.insertId });
  } catch (err) {
    console.error("Erreur lors de l'ajout du statut:", err);
    res.status(500).json({ error: "Erreur lors de l'ajout du statut" });
  }
};

const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const taskStatus = await TaskStatus.getById(id);
    if (taskStatus.length === 0) {
      return res.status(404).json({ error: "Statut non trouvé" });
    }

    await TaskStatus.update(id, status);
    res.json({ message: "Statut mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du statut:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const deleteTaskStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const taskStatus = await TaskStatus.getById(id);
    if (taskStatus.length === 0) {
      return res.status(404).json({ error: "Statut non trouvé" });
    }

    await TaskStatus.delete(id);
    res.json({ message: "Statut supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression du statut:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = {
  getAllTaskStatus,
  getTaskStatusById,
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
};