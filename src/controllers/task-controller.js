const { Task, TaskStatus } = require("../models");

// Fonction pour convertir les dates en format compatible avec MySQL
const formatDateForMySQL = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.getAll();
    res.json(tasks);
  } catch (err) {
    console.error("Erreur lors de la récupération des tâches:", err.sqlMessage);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await Task.getById(id);
    if (tasks.length === 0) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }
    res.json(tasks[0]);
  } catch (err) {
    console.error("Erreur SQL:", err.sqlMessage);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status = "En cours", startDate, endDate } = req.body;

    // Vérifier si le statut existe dans taskstatus
    const statusExists = await TaskStatus.getByStatus(status);
    if (statusExists.length === 0) {
      return res.status(400).json({ error: "Le status fourni n'existe pas" });
    }

    // Convertir les dates en format compatible avec MySQL
    const formattedStartDate = formatDateForMySQL(startDate);
    const formattedEndDate = formatDateForMySQL(endDate);

    // Insérer la tâche
    const result = await Task.create(title, description, status, formattedStartDate, formattedEndDate);
    res.status(201).json({ message: "Tâche ajoutée avec succès", taskId: result.insertId });
  } catch (err) {
    console.error("Erreur lors de l'insertion:", err.sqlMessage);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, startDate, endDate } = req.body;

    // Vérifier si la tâche existe
    const task = await Task.getById(id);
    if (task.length === 0) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    // Vérifier si le statut existe dans taskstatus
    const statusExists = await TaskStatus.getByStatus(status);
    if (statusExists.length === 0) {
      return res.status(400).json({ error: "Le status fourni n'existe pas" });
    }

    // Convertir les dates en format compatible avec MySQL
    const formattedStartDate = formatDateForMySQL(startDate);
    const formattedEndDate = formatDateForMySQL(endDate);

    // Mettre à jour la tâche
    await Task.update(id, title, description, status, formattedStartDate, formattedEndDate);
    res.json({ message: "Tâche mise à jour avec succès" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour:", err.sqlMessage);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Vérifier si la tâche existe
    const task = await Task.getById(id);
    if (task.length === 0) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    // Vérifier si le statut existe dans taskstatus
    const statusExists = await TaskStatus.getByStatus(status);
    if (statusExists.length === 0) {
      return res.status(400).json({ error: "Le status fourni n'existe pas" });
    }

    // Mettre à jour la tâche
    await Task.updateStatus(id, status);
    res.json({ message: "Tâche mise à jour avec succès" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour:", err.sqlMessage);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Task.delete(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }
    res.json({ message: "Tâche supprimée avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression:", err.sqlMessage);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const getTaskByIdAndStatus = async (req, res) => {
  try {
    const { id, status } = req.params;
    const task = await Task.getByIdAndStatus(id, status);

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
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskByIdAndStatus,
};