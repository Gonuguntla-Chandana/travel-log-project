const dotenv = require('dotenv');
dotenv.config(); // MUST be first before any other require

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logRoute = require("./routes/logs");
const authRoute = require("./routes/auth");
const { configureCloudinary } = require("./utils/cloudinary");

configureCloudinary(); // call AFTER dotenv.config()

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('common'));

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.log("MongoDB Error:", err));

app.get("/", (req, res) => {
  res.status(200).json("Welcome to the Travel Log API!");
});

app.use("/api/logs", logRoute);
app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
