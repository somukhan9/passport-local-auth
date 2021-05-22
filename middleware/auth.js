exports.ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ success: false, message: "UnAuthorized" });
  }
};

exports.ensureGuest = (req, res, next) => {
  if (req.isAuthenticated()) {
    res
      .status(400)
      .json({ success: false, message: "Your are already logged in" });
  } else {
    next();
  }
};
