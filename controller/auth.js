const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const isEmail = require("../config/validator");

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, repeatPassword } = req.body;
    if (!name || !email || !password || !repeatPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All the fields are required" });
    }
    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email is badly formatted" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Length of password should be at least 6",
      });
    }
    if (password !== repeatPassword) {
      return res.status(400).json({
        success: false,
        message: "Password did not match",
      });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exist with this email",
      });
    }

    user = await User.create(req.body);
    // sendMail(email);
    const emailVerificationToken = user.createEmailVerificationToken(user._id);
    user.sendEmailVerificationEmail(email, emailVerificationToken);
    passport.authenticate("local", {
      failureRedirect: "/auth/failure",
      successRedirect: "/auth/success",
      failureFlash: true,
    })(req, res, next);
    // next();
    // res.status(201).json({ success: true, user });
  } catch (error) {
    console.error(error);
  }
};

exports.login = (req, res, next) => {
  passport.authenticate("local", {
    failureRedirect: "/auth/failure",
    successRedirect: "/auth/success",
    failureFlash: true,
  })(req, res, next);
};

exports.success = (req, res) => {
  console.log(req.user);
  const user = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  };
  req.session.userId = user.id;
  res.json({ success: true, user });
};

exports.failure = (req, res) => {
  const message = req.flash("error")[0];
  res.json({ success: false, message });
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.clearCookie();
  req.logOut();
  res.json({ success: true, message: "Logged Out" });
};

exports.getUser = (req, res) => {
  const user = req.user;
  res.json({ success: true, user });
};

exports.verify = async (req, res) => {
  try {
    const { token } = req.query;
    const { id } = jwt.verify(token, process.env.EMAIL_VERIFY_TOKEN_SECRET);
    if (!token) {
      return res.status(400).json({ success: false, message: "Invalid Token" });
    }
    await User.findByIdAndUpdate(id, { emailVerified: true }, { new: true });
    // console.log(req.query);
    res.redirect(process.env.ORIGIN);
    // res.json({ success: true, message: "Your email has been verified" });
  } catch (error) {
    console.error(error);
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const id = req.user.id;
    let user = await User.findById(id);
    const emailVerificationToken = user.createEmailVerificationToken(id);
    user.sendEmailVerificationEmail(user.email, emailVerificationToken);
    res.json({
      success: true,
      message: "Email verification link has been resend to your email",
    });
  } catch (error) {
    console.error(error);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "You have to give a email" });
    }
    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email is badly formatted" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "No user found with this email" });
    }
    const resetPasswordToken = user.createResetPasswordToken(user._id);
    user.sendPasswordRestLink(email, resetPasswordToken);
    res.json({
      success: true,
      message:
        "Check your email Reset password link has been sent to your account",
    });
  } catch (error) {
    console.error(error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, repeatPassword } = req.body;
    const { token } = req.params;
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Your have to give a password" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Length of password should be at least 6",
      });
    }
    if (password !== repeatPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password did not match" });
    }

    const { id } = jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET);

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(id, { password: hash }, { new: true });

    res.json({
      success: true,
      message: "Password has been updated successfully",
    });
  } catch (error) {
    console.error(error);
  }
};
