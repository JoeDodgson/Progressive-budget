// Require in node modules
const express = require("express");

// Require in local modules
const Transaction = require("../models/transaction.js");

// Declare the express router
const router = express.Router();

// Handle api/transaction post request for a single transaction
router.post("/api/transaction", ({body}, res) => {
  // Create a new entry in the mongoDB database, using the request body
  Transaction.create(body)

  // Return the response to this database operation 
  .then(dbTransaction => {
    res.json(dbTransaction);
  })
  .catch(err => {
    res.status(404).json(err);
  });
});

// Handle api/transaction/bulk post request for multiple transactions
router.post("/api/transaction/bulk", ({body}, res) => {
  // Create multiple entries in the mongoDB database, using the request body
  Transaction.insertMany(body)

  // Return the response to this database operation 
  .then(dbTransaction => {
    res.json(dbTransaction);
  })
  .catch(err => {
    res.status(404).json(err);
  });
});

// Handle api/transaction/bulk get request
router.get("/api/transaction", (req, res) => {
  // Retrieve all records from the mongoDB database, sorting data in descending date order (most recent first)
  Transaction.find({}).sort({date: -1})
  
  // Return the response to this database operation 
  .then(dbTransaction => {
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

module.exports = router;