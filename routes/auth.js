const router = require("express").Router();
const passport = require("passport");
const authController = require("../controller/auth");

router.post("/signup", authController.signup);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    successRedirect: "/auth/success",
  })
);

router.get("/success", (req, res) => {
  console.log(req.user);
  const user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  };
  req.session.userId = user.id;
  res.json({ success: true, user });
});

router.get("/logout", (req, res) => {
  req.logOut();
  req.session.destroy();
  res.send("Logged Out");
});

module.exports = router;
