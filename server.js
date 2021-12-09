const express = require("express");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
const apiRouter = require("./routes");

const bodyParser = require("body-parser");

const app = express();

connectDB();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use("/user", apiRouter);

app.listen(PORT, () => {
  console.log(`Server is Up and Running ${PORT}`);
});
