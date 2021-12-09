const router = require("express").Router();
const UserRouter = require("./signup");
const ForgetRouter = require("./forget");
const loginRouter = require("./login");

router.use("/", UserRouter);
router.use("/", ForgetRouter);
router.use("/", loginRouter);

module.exports = router;
