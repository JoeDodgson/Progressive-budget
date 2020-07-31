// Declare variables
let db;
let allTransactions;

// Create a new db request for a budget database
const request = window.indexedDB.open("budget", 1);

// Specify an object store for transactions
request.onupgradeneeded = event => {
  db = event.target.result;
  // Create object store called 'transactions' and set autoIncrement to true
  const objStore = db.createObjectStore("transactions", { autoIncrement: true });
  objStore.createIndex("name", "name");
};

// On success, store the result in the db variable
request.onsuccess = ({ target }) => {
  db = target.result;
};

request.onerror = event => {
  console.log(`Error - db.js - request: ${event.target.errorCode}`);
};

const saveRecord = record => {
  // Create a transaction on the 'transactions' db with readwrite access
  const transaction = db.transaction(["transactions"], "readwrite");

  // Access the 'transactions' object store
  const store = transaction.objectStore("transactions");

  // Add the record to your store with add method
  store.add(record);
}

const fulfilRequests = () => {
  // Open a transaction on the 'transactions' db
  const transaction = db.transaction(["transactions"], "readwrite");

  // Access the 'transactions' object store
  const store = transaction.objectStore("transactions");
  const index = store.index("name");

  // Get all records from store and set to a variable
  allTransactions = index.getAll();
  
  allTransactions.onsuccess = () => {
    if (allTransactions.result.length > 0) {
      // Filter the results for only those which are pending
      const pendingTransactions = allTransactions.result.filter(result => result.pending);

      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(pendingTransactions),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.json())
      .then(() => {
        // If successful, open a transaction on the transactions object store
        const transaction = db.transaction(["transactions"], "readwrite");

        // Access the transactions object store
        const store = transaction.objectStore("transactions");

        // Clear all records from the object store
        store.clear();

        // For all transactions, set the pending property to false, then add to the database
        allTransactions.result.forEach(item => {
          item.pending = false;
          store.add(item);
        })
      });
    }
  };
}

// Event listener to check if the application comes online
// If application comes online, fulfil the pending API requests
window.addEventListener("online", fulfilRequests);


// Define variables
let transactions = [];
let myChart;

// Submit a get request for all transactions
fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // Save the data returned by the get request
    transactions = data;

    // Open a transaction on the transactions object store
    const transaction = db.transaction(["transactions"], "readwrite");

    // Access the transactions object store
    const store = transaction.objectStore("transactions");

    // Clear all records from the object store
    store.clear();

    // Store all transactions in the IDB
    transactions.forEach(item => {
      store.add(item);
    })

    // Populate the front end
    populateAll();
  });
  
// Calculates the total budget remaining and sets the text content of the #total element to that value
const populateTotal = () => {
  // Reduces all transactions down to a single remaining budget. Start with zero and add every transaction value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);
  
  // Set the text content of the #total element to the remaining budget
  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}
  
// Populate the transaction table with all transactions
const populateTable = () => {
  // Store the table body element as a variable and set its innerHTML to an empty string
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";
  
  // Create and populate a table row for each transaction
  transactions.forEach(transaction => {
    let tr = document.createElement("tr");
    tr.innerHTML = `
    <td>${transaction.name}</td>
    <td>${transaction.value}</td>
    `;
    
    // Append the new table row to the table body
    tbody.appendChild(tr);
  });
}
  
// Populates the chart which displays all the transaction
const populateChart = () => {
  // Initialise the sum variable
  let sum = 0;
  
  // Reverse the transactions array and store as a new variable
  let reversed = transactions.slice().reverse();
  
  // Create date labels for the chart x-axis
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });
  
  // Create an array of the budget remaining after each transaction - to be used as chart data
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });
  
  // Remove the old chart (if it exists)
  if (myChart) {
    myChart.destroy();
  }
  
  // Select the chart element from the DOM
  let ctx = document.getElementById("myChart").getContext("2d");
  
  // Create a new chart
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: "Total Over Time",
        fill: true,
        backgroundColor: "#6666ff",
        data
      }]
    }
  });
}
  
  // Processes a transaction sent by clicking the add / subtract funds button
const sendTransaction = isAdding => {
    // Store DOM elements as variables
    let nameEl = document.querySelector("#t-name");
    let amountEl = document.querySelector("#t-amount");
    let errorEl = document.querySelector(".form .error");
    
    // If the user has not entered a name or amount, display error message
    if (nameEl.value === "" || amountEl.value === "") {
      errorEl.textContent = "Missing Information";
      return;
    }
    else {
      errorEl.textContent = "";
    }
    
    // Create a transaction record using the name and amount entered by the user, along with current date
    let transaction = {
      name: nameEl.value,
      value: amountEl.value,
      date: new Date().toISOString(),
      pending: false
    };

    // If subtracting funds, convert amount to negative number
    if (!isAdding) {
      transaction.value *= -1;
    }
    
    // Add to the beginning of the transactions array
    transactions.unshift(transaction);
    
    // Populate the front end
    populateAll();
    
    // Check if the application is online
    if (navigator.onLine) {
      // If the application is online, send a post request to the server
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(transaction),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => {    
        return response.json();
      })
      .then(data => {
        if (data.errors) {
          errorEl.textContent = "Missing Information";
        }
        else {
          // Clear the form (name and amounts entered by the user) in the front end
          nameEl.value = "";
          amountEl.value = "";
        }
      })
      .catch(err => {
        console.log(`index.js - sendTransaction() - fetch("/api/transaction") - Error: ${err}`);
        
        // Clear the form (name and amounts entered by the user) in the front end
        nameEl.value = "";
        amountEl.value = "";
      });
    }

    // If the app is offline, set the transaction's pending property to true
    else {
      transaction.pending = true;
    }

    // Store the post request in the indexedDB
    saveRecord(transaction);
}

// Call all 'populate' functions to update the front end displaying all transactions
const populateAll = () => {
  populateTotal();
  populateTable();
  populateChart();
}

// When the user clicks the 'add funds' button, call the sendTransaction function, passing in isAdding = true
document.querySelector("#add-btn").onclick = () => {
  sendTransaction(true);
};

// When the user clicks the 'subtract funds' button, call the sendTransaction function, passing in isAdding = false
document.querySelector("#sub-btn").onclick = () => {
  sendTransaction(false);
};
