const User = require("../model/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const router = require("express").Router();
const dotenv = require("dotenv");
dotenv.config();

router.post("/forget", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user.verified) {
      if (user) {
        const token = jwt.sign({ id: user._id }, process.env.SECURE_KEY, {
          expiresIn: "2m",
        });
        const transporter = nodemailer.createTransport({
          service: process.env.PLATFORM,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
          },
        });
        const info = await transporter.sendMail({
          from: process.env.EMAIL,
          to: req.body.email,
          subject: "Reset your Passoword",
          html: `
                <div> 
                <p  style="color: black;  font-variant: small-caps; font-family: sans-serif; font-size:22px"> Hello <b>${user.name}</b> your password change request is successfully initiated.</p>
                <div> 
                <button style="padding:10px; outline:none;">
                <a style="color: black; text-decoration: none;" href="http://localhost:5000/user/forget-pass/${token}">Click here to reset-password</a>
                </button>
                <p style="color: black; font-family: sans-serif; font-size:15px">This link has been expire in 2 minutes</p>
                <p style="color: black; font-family: sans-serif; font-size:15px">For Mini Team </p>
               </div>
               </div>
                `,
        });
        if (info) {
          console.log(info);
        }
        res.json({ user });
      } else {
        res.json({ msg: "Invalid Email-Id" });
      }
    } else {
      res.json({
        msg: "Your account is not verified! Please verify your account",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/forget-pass/:token", (req, res) => {
  res.render("forget", { token: req.params.token });
});

router.post("/forget-pass/:token", async (req, res) => {
  try {
    const token = req.params.token;

    jwt.verify(token, process.env.SECURE_KEY, async (err, decoded) => {
      if (err) {
        return res.render("fail", {
          msg1: "Token has been expired! Please Try again",
        });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          console.log(req.body.password);
          bcrypt.hash(req.body.password, salt).then(async (hash) => {
            await User.findByIdAndUpdate(
              { _id: decoded.id },
              { password: hash },
              { new: true }
            );
            res.render("fail", {
              msg1: "Password has been changed successfully please go to login!",
            });
          });
        });
      }
    });
  } catch (error) {
    return res.json({ msg: error.message });
  }
});

module.exports = router;
