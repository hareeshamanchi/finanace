let balance = 0;
const transactions = [];
let editIndex = -1;

document.getElementById('transactionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;

    if (editIndex === -1) {
        transactions.push({ description, amount, date, type, category });
        balance += (type === 'income' ? amount : -amount);
        showFeedback(`Added ${type}: $${amount.toFixed(2)} in ${category}`);
    } else {
        const oldTransaction = transactions[editIndex];
        balance += (type === 'income' ? amount : -amount) - (oldTransaction.type === 'income' ? oldTransaction.amount : -oldTransaction.amount);
        transactions[editIndex] = { description, amount, date, type, category };
        showFeedback(`Updated transaction: ${type}: $${amount.toFixed(2)} in ${category}`);
        editIndex = -1;
    }

    clearForm();
    updateUI();
});

function updateUI() {
    document.getElementById('balance').innerText = `Current Balance: $${balance.toFixed(2)}`;

    const transactionsList = document.getElementById('transactions');
    transactionsList.innerHTML = '';
    transactions.forEach((transaction, index) => {
        const li = document.createElement('li');
        li.innerText = `${transaction.date} - ${transaction.description}: $${transaction.amount.toFixed(2)} (${transaction.type}, ${transaction.category})`;
        
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.onclick = () => editTransaction(index);

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.onclick = () => deleteTransaction(index);

        li.appendChild(editButton);
        li.appendChild(deleteButton);
        transactionsList.appendChild(li);
    });

    updateChart();
}

function showFeedback(message) {
    const feedbackElement = document.getElementById('formFeedback');
    feedbackElement.innerText = message;
    feedbackElement.style.display = 'block';

    setTimeout(() => {
        feedbackElement.innerText = '';
        feedbackElement.style.display = 'none';
    }, 3000);
}

function clearForm() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
    document.getElementById('type').value = 'income';
    document.getElementById('category').value = 'General';
}

function editTransaction(index) {
    const transaction = transactions[index];
    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('date').value = transaction.date;
    document.getElementById('type').value = transaction.type;
    document.getElementById('category').value = transaction.category;
    editIndex = index;
}

function deleteTransaction(index) {
    const transaction = transactions[index];
    balance -= (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    transactions.splice(index, 1);
    showFeedback(`Deleted transaction: ${transaction.description}`);
    updateUI();
}

function updateChart() {
    const expenseTransactions = transactions.filter(transaction => transaction.type === 'expense');
    const categories = [...new Set(expenseTransactions.map(transaction => transaction.category))];

    const categorySums = categories.map(category => {
        return expenseTransactions
            .filter(transaction => transaction.category === category)
            .reduce((sum, transaction) => sum + transaction.amount, 0);
    });

    console.log('Categories:', categories);
    console.log('Category Sums:', categorySums);

    const ctx = document.getElementById('expensesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Expenses',
                data: categorySums,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Categories'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            }
        }
    });
}

function updateMonthlyChart() {
    const currentMonth = new Date().getMonth();
    const expenseTransactions = transactions.filter(transaction => {
        const transactionMonth = new Date(transaction.date).getMonth();
        return transaction.type === 'expense' && transactionMonth === currentMonth;
    });
    const categories = [...new Set(expenseTransactions.map(transaction => transaction.category))];

    const categorySums = categories.map(category => {
        return expenseTransactions
            .filter(transaction => transaction.category === category)
            .reduce((sum, transaction) => sum + transaction.amount, 0);
    });

    console.log('Monthly Categories:', categories);
    console.log('Monthly Category Sums:', categorySums);

    const ctx = document.getElementById('expensesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Monthly Expenses',
                data: categorySums,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Categories'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            }
        }
    });
}

updateUI();
