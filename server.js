const express = require("express");
const app = express();
const router = require("./routes/routes");
const mongoose = require("mongoose");
const session = require("express-session");

const passport = require("passport");
const PORT = 6584;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
// connected to the server
mongoose.connect("mongodb://127.0.0.1:27017/instaDB").then(
  app.listen(PORT, () => {
    console.log(`server is started at http://localhost:${PORT}`);
  })
);

app.use("/", router);
