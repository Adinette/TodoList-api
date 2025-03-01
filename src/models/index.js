const mysql = require("mysql");
const util = require("util");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Convertir les requêtes en version async/await
const query = util.promisify(connection.query).bind(connection);

// Modèle pour les tâches
const Task = {
  getAll: async () => {
    return await query("SELECT * FROM task");
  },
  getById: async (id) => {
    return await query("SELECT * FROM task WHERE id = ?", [id]);
  },
  create: async (title, description, status, startDate, endDate) => {
    return await query(
      "INSERT INTO task (title, description, status, startDate, endDate) VALUES (?, ?, ?, ?, ?)",
      [title, description, status, startDate, endDate]
    );
  },
  update: async (id, title, description, status, startDate, endDate) => {
    return await query(
      "UPDATE task SET title = ?, description = ?, status = ?, startDate = ?, endDate = ? WHERE id = ?",
      [title, description, status, startDate, endDate, id]
    );
  },
  delete: async (id) => {
    return await query("DELETE FROM task WHERE id = ?", [id]);
  },
  getByIdAndStatus: async (id, status) => {
    return await query("SELECT * FROM task WHERE id = ? AND status = ?", [
      id,
      status,
    ]);
  },
  updateStatus: async (id, status) => {
    return await query("UPDATE task SET status = ? WHERE id = ?", [status, id]);
  },
};

// Modèle pour les statuts des tâches
const TaskStatus = {
  getAll: async () => {
    return await query("SELECT * FROM taskstatus");
  },
  getById: async (id) => {
    return await query("SELECT * FROM taskstatus WHERE id = ?", [id]);
  },
  getByStatus: async (status) => {
    return await query("SELECT * FROM taskstatus WHERE status = ?", [status]);
  },
  create: async (status) => {
    return await query("INSERT INTO taskstatus (status) VALUES (?)", [status]);
  },
  update: async (id, status) => {
    return await query("UPDATE taskstatus SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
  },
  delete: async (id) => {
    return await query("DELETE FROM taskstatus WHERE id = ?", [id]);
  },
};

// Modèle pour les utilisateurs
const User = {
  getAll: async () => {
    return await query("SELECT * FROM user");
  },
  getById: async (id) => {
    return await query("SELECT * FROM user WHERE id = ?", [id]);
  },
  create: async (username, email, password) => {
    return await query(
      "INSERT INTO user (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );
  },
  update: async (id, username, email, password) => {
    return await query(
      "UPDATE user SET username = ?, email = ?, password = ? WHERE id = ?",
      [username, email, password, id]
    );
  },
  delete: async (id) => {
    return await query("DELETE FROM user WHERE id = ?", [id]);
  },
};

// Modèle pour l'authentification
const auth = {
  getByEmail: async (email) => {
    return await query("SELECT * FROM user WHERE email = ?", [email]);
  },
  updateResetToken: async (email, token, expiration) => {
    return await query(
      "UPDATE user SET reset_token = ?, reset_token_expiration = ? WHERE email = ?",
      [token, expiration, email]
    );
  },
  getByResetToken: async (token) => {
    return await query(
      "SELECT * FROM user WHERE reset_token = ? AND reset_token_expiration > ?",
      [token, Date.now()]
    );
  },
  updatePassword: async (token, password) => {
    return await query(
      "UPDATE user SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = ?",
      [password, token]
    );
  },
  clearResetToken: async (token) => {
    return await query(
      "UPDATE user SET reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = ?",
      [token]
    );
  }
};

module.exports = {
  Task,
  User,
  TaskStatus,
  auth,
  connection,
};
