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
      date: new Date().toISOString()
    };

    // If subtracting funds, convert amount to negative number
    if (!isAdding) {
      transaction.value *= -1;
    }
    
    // Add to the beginning of the transactions array
    transactions.unshift(transaction);
    
    // Populate the front end
    populateAll();
    
    // Send a post request to the server
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
    // fetch failed, so save in indexed db
    saveRecord(transaction);
    
    // Clear the form (name and amounts entered by the user) in the front end
    nameEl.value = "";
    amountEl.value = "";
  });
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
