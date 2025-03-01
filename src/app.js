require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(session({ secret: "mysecret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const users = require("./routes/user");
app.use("/user", users);
const auth = require("./routes/auth");
app.use("/auth", auth);
const tasks = require("./routes/task");
app.use("/task", tasks);
const tasksStatus = require("./routes/task-status");
app.use("/task-status", tasksStatus);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = app;