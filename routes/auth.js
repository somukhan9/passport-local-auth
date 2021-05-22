const router = require("express").Router();
const authController = require("../controller/auth");
const authMiddleware = require("../middleware/auth");

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/success", authController.success);

router.get("/failure", authController.failure);

router.get("/logout", authController.logout);

router.get("/getUser", authMiddleware.ensureAuth, authController.getUser);

router.get("/verify", authController.verify);

router.get(
  "/resend_verification",
  authMiddleware.ensureAuth,
  authController.resendVerification
);

router.post("/forgot_password", authController.forgotPassword);

router.put("/reset_password/:token", authController.resetPassword);

module.exports = router;
