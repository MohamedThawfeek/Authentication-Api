const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/users");
const router = require("express").Router();
const dotenv = require("dotenv");
dotenv.config();

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        if (user.verified) {
          const token = jwt.sign({ id: user.id }, process.env.SECURE_KEY, {
            expiresIn: "10m",
          });
          res.json({ msg: token });
        } else {
          res.json({ msg: "Verify your Account" });
        }
      } else {
        res.json({ msg: "Wrong Password" });
      }
    } else {
      res.json("No User Found");
    }
  } catch (error) {
    res.json({ msg: error.message });
  }
});
const verify = (req, res, next) => {
  const token = req.headers["authorization"];
  if (token) {
    jwt.verify(token, process.env.SECURE_KEY, (err, decoded) => {
      if (err) {
        console.log(err);
        res.json({ msg: "Access Denied" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

router.get("/data", verify, async (req, res) => {
  try {
    const userID = req.userId;
    const user = await User.find({ _id: userID });
    res.json(user);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
