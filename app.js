const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./config/.env" });
}

app.use(cors());

//using middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Importing routes
const post = require("./routes/post");
const user = require("./routes/user");
const payment = require("./routes/paymentRoutes");
const wishList = require("./routes/wishList");


// using routes
app.use("/api/v1", post);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", wishList);

module.exports = app;
