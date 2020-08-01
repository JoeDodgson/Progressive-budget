// Require in node modules
const mongoose = require("mongoose");

// Store mongoose schema class as separate variable
const Schema = mongoose.Schema;

// Define a new mongoose schema
const transactionSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Enter a name for transaction"
    },
    value: {
      type: Number,
      required: "Enter an amount"
    },
    date: {
      type: Date,
      default: Date.now
    }
  }
);

// Create the mongoose model using the schema and export it
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
