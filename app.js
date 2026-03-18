require("dotenv").config();

const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();

app.use(express.json());

const authRoutes = require("./routes/authRoutes");

app.use("/api", authRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
  console.log(process.env.EMAIL);
});

