require("dotenv").config();

const express = require("express");
const port = process.env.PORT || 5000;
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(session({ secret: "mysecret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const connection = require("./connection");

const users = require("./routes/user");
app.use("/user", users);
const auth = require("./routes/auth");
app.use("/auth", auth);
const tasks = require("./routes/task");
app.use("/task", tasks);
const tasksStatus = require("./routes/taskStatus");
app.use("/taskStatus", tasksStatus);


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});


// Vérifiez la connexion à la base de données avant de démarrer le serveur
connection.connect((err) => {
    if (err) {
      console.error("Erreur de connexion à la base de données:" + err.stack);
      return;
    }
    console.log("Connexion à la base de données établie");
  
    // Démarrez le serveur uniquement si la connexion est réussie
    app.listen(port, () => {
      console.log(`Serveur est en ligne sur le port ${port}`);
    });
  });

