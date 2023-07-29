const passport = require("passport");
const LocalStrategy = require("passport-local");
const Users = require("../models/Users");
const { ObjectId } = require("mongodb");
passport.use(
  new LocalStrategy(async function (username, password, done) {
    try {
      const user = await Users.findOne({ username: username });
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
passport.serializeUser(function (user, done) {
  console.log(user);
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  console.log("hi");
  Users.findOne({ _id: new ObjectId(id) })
    .then((user) => {
      console.log(user);
      done(null, user);
    })
    .catch((err) => {
      console.log(err);
      done(err, false);
    });
});
module.exports = passport;
