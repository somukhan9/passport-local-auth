const User = require("../model/User");
const bcrypt = require("bcryptjs");
const isEmail = require("../config/validator");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
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
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exist with this email",
      });
    }

    user = await User.create(req.body);

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error(error);
  }
};
