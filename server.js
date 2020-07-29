// Require in node modules
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

// Define port
const PORT = 3000;

// Set up express server
const app = express();

// Set up middleware
app.use(logger("dev"));
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the public folder to the user
app.use(express.static("public"));

// Connect to mongoDB database using mongoose
mongoose.connect("mongodb://localhost/budget", {
  useNewUrlParser: true,
  useFindAndModify: false
});

// Define routes
app.use(require("./routes/api.js"));

// Start server by adding listener
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});