const express = require('express');
const mysql = require('mysql');
const router = express.Router();

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "todo",
    port: 3306,
});

module.exports = connection;