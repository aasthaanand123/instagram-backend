const passport = require("passport");
const LocalStrategy = require("passport-local");
const users = require("../models/Users");
passport.use(
  new LocalStrategy(async function (username, password, done) {
    try {
      const user = await users.findOne({ username: username });
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
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  users
    .findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, false);
    });
});
module.exports = passport;
