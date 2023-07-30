const express = require("express");
const app = express();
const router = require("./routes/routes");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./auth/passport");
const cors = require("cors");
const PORT = 6584;
app.use(
  session({
    secret: "newsercret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());
mongoose.connect("mongodb://127.0.0.1:27017/instaDB").then(
  app.listen(PORT, () => {
    console.log(`server is started at http://localhost:${PORT}`);
  })
);
app.use("/", router);
