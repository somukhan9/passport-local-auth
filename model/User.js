const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const transporter = require("../config/nodemailer");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.error(error);
  }
});

userSchema.methods.createEmailVerificationToken = (id) => {
  try {
    const token = jwt.sign({ id }, process.env.EMAIL_VERIFY_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    return token;
  } catch (error) {
    console.error(error);
    return;
  }
};

userSchema.methods.createResetPasswordToken = (id) => {
  try {
    const token = jwt.sign({ id }, process.env.RESET_PASSWORD_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    return token;
  } catch (error) {
    console.error(error);
    return;
  }
};

userSchema.methods.sendEmailVerificationEmail = (email, token) => {
  const mailOptions = {
    from: process.env.NODE_MAILER_USER_EMAIL,
    to: email,
    subject: "Email verification for iStory",
    html: `<h4>Follow the link below and verify your email</h4>
            <a href=${process.env.SERVER_BASE_URL}/auth/verify?token=${token}>Follow this link and verify your email</a>
          `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log(`Email sent to ${email} ${info.response}`);
    }
  });
};

userSchema.methods.sendPasswordRestLink = (email, token) => {
  const mailOptions = {
    from: process.env.NODE_MAILER_USER_EMAIL,
    to: email,
    subject: "Reset Password for iStory",
    html: `<h4>Follow the link below and reset your password</h4>
            <a href=${process.env.ORIGIN}/reset/${token}>Follow this link and reset password</a>
          `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log(`Email sent to ${email} ${info.response}`);
    }
  });
};

module.exports = mongoose.model("User", userSchema);
