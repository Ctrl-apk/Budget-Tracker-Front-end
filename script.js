let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let expenseChart = null; // Keep a reference to the chart

// Function to add an expense
function addExpense() {
    const category = document.getElementById('category').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);

    if (category && amount && !isNaN(amount)) {
        expenses.push({ category, amount });

        // Save updated expenses to local storage
        localStorage.setItem('expenses', JSON.stringify(expenses));

        updateExpenseList();
        updateChart();
    } else {
        alert("Please enter a valid category and amount.");
    }
}

// Function to update the list of expenses
function updateExpenseList() {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = ''; // Clear existing list

    expenses.forEach((expense, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${expense.category}: $${expense.amount.toFixed(2)}</span>
            <button onclick="deleteExpense(${index})">Delete</button>
        `;
        expenseList.appendChild(listItem);
    });
}

// Function to delete an expense
function deleteExpense(index) {
    expenses.splice(index, 1);  // Remove the expense at the given index
    localStorage.setItem('expenses', JSON.stringify(expenses)); // Update local storage
    updateExpenseList();
    updateChart();
}

// Function to generate consistent colors for the chart
function generateCategoryColors(categories) {
    const colorMap = {};
    categories.forEach(category => {
        if (!colorMap[category]) {
            colorMap[category] = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        }
    });
    return colorMap;
}

// Function to update the expense chart
function updateChart() {
    const categoryData = {};
    expenses.forEach(expense => {
        categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const colors = Object.values(generateCategoryColors(labels));

    const ctx = document.getElementById('expenseChart').getContext('2d');

    if (!expenseChart) {
        // Create chart if it doesn't exist
        expenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expenses by Category',
                    data: data,
                    backgroundColor: colors,
                    borderColor: ['#fff', '#fff', '#fff'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } else {
        // Update existing chart
        expenseChart.data.labels = labels;
        expenseChart.data.datasets[0].data = data;
        expenseChart.data.datasets[0].backgroundColor = colors;
        expenseChart.update();
    }
}

// Function for currency conversion using API
function convertCurrency() {
    const amount = parseFloat(document.getElementById('amountToConvert').value);
    const fromCurrency = document.getElementById('currencyFrom').value;
    const toCurrency = document.getElementById('currencyTo').value;

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount to convert.");
        return;
    }

    fetch(`https://v6.exchangerate-api.com/v6/61db0dfbeb8b22794ad6f3b0/latest/${fromCurrency}`)
        .then(response => response.json())
        .then(data => {
            if (data.conversion_rates && data.conversion_rates[toCurrency]) {
                const rate = data.conversion_rates[toCurrency];
                const convertedAmount = amount * rate;
                document.getElementById('conversionResult').textContent =
                    `${amount.toFixed(2)} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
            } else {
                document.getElementById('conversionResult').textContent = "Error fetching conversion rates.";
            }
        })
        .catch(err => {
            console.error("Currency API error:", err);
            document.getElementById('conversionResult').textContent = "API request failed.";
        });
}

// Function to fetch and display a random budget tip
async function fetchBudgetTip() {
    try {
        const response = await fetch("https://budget-tracker-back-end-1.onrender.com/quote");

        const data = await response.json();

        if (data.length > 0) {
            document.getElementById("quoteDisplay").innerText = `"${data[0].q}" - ${data[0].a}`;
        }
    } catch (error) {
        console.error("Error fetching quote:", error);
        document.getElementById("quoteDisplay").innerText = "Failed to load tip.";
    }
}

// Event listener for the new quote button
document.getElementById("newQuoteBtn").addEventListener("click", fetchBudgetTip);

// Ensure everything loads properly
document.addEventListener("DOMContentLoaded", function () {
    updateExpenseList(); // Load from localStorage
    updateChart(); // Refresh the chart
    fetchBudgetTip(); // Fetch a new quote
});
