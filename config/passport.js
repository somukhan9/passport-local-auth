const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../model/User");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async function (username, password, done) {
      try {
        let user = await User.findOne({ email: username });
        if (!user) {
          return done(null, false, { message: "User not found" });
        } else {
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid credentials" });
          }
          return done(null, user);
        }
      } catch (error) {
        console.error(error.message);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  const user = await User.findById(userId);
  if (!user) {
    return done(null, false);
  } else {
    return done(null, user);
  }
});
