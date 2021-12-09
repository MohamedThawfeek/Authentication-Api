const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../model/users");
const router = require("express").Router();
const dotenv = require("dotenv");
dotenv.config();

router.post("/signup", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt).then(async (hash) => {
          const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash,
          });
          const result = await user.save();
          const token = jwt.sign({ id: user.id }, process.env.SECURE_KEY);
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
            subject: "Welcome to our Platform",
            html: `
              <div> 
            <p style="color: black; font-family: sans-serif; font-size:22px"> welcome  <b>${req.body.name}</b> Thank you  for choosing our platform and keep Growing with us.</p>
              <div> 
              <button style="padding:10px; outline:none;">
              <a style="color: black; text-decoration: none;" href="http://localhost:5000/user/verify/${token}">Verify Email</a> </button>
              <p style="color: black; font-family: sans-serif; font-size:15px">Thanks For Regards </p>
              <p style="color: black; font-family: sans-serif; font-size:15px">For Mini Team </p>
              </div>
             </div>
              `,
          });
          if (info) {
            console.log(info);
          }
          res.json(result);
        });
      });
    } else {
      return res.json({
        mgs: "This user is already here! Go to the login page. Otherwise try another email.",
      });
    }
  } catch (error) {
    res.json({ msg: error.message });
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;
    jwt.verify(token, process.env.SECURE_KEY, async (err, decoded) => {
      if (err) {
        return;
      } else {
        const user = await User.findByIdAndUpdate(
          { _id: decoded.id },
          { verified: true },
          { new: true }
        );
        res.render("fail", {
          msg1: "Your Account has been Verified! Now You can Go to the Login Page ",
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
