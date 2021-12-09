const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const url = process.env.DB_URL;

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(url);
    console.log(`MongoDB Connected ${connect.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
