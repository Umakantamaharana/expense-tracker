// API endpoint
const API_URL = '/api/expenses';

// Loading state management
const setLoading = (isLoading) => {
    const submitButton = document.querySelector('#expenseForm button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = isLoading;
        submitButton.innerHTML = isLoading 
            ? '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...'
            : '<i class="bi bi-plus-circle"></i> Add Expense';
    }
};

// Function to show messages
function showMessage(message, type = 'success') {
    const messageElement = document.getElementById("message");
    messageElement.innerText = message;
    messageElement.className = `text-center mt-3 mb-4 ${type === 'error' ? 'text-danger' : 'text-success'}`;
    
    if (type === 'success') {
        setTimeout(() => {
            messageElement.innerText = '';
            messageElement.className = 'text-center mt-3 mb-4';
        }, 3000);
    }
}

// Function to fetch all expenses
async function fetchExpenses() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const expenses = await response.json();
        return Array.isArray(expenses) ? expenses : [];
    } catch (error) {
        showMessage('❌ Error loading expenses: ' + error.message, 'error');
        return [];
    }
}

// Function to fetch statistics
async function fetchStatistics() {
    try {
        const response = await fetch('/api/statistics');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        updateStatistics(data);
    } catch (error) {
        showMessage('❌ Error loading statistics: ' + error.message, 'error');
    }
}

// Function to add a new expense
async function addExpense(expense) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to add expense');
        }
        return data;
    } catch (error) {
        throw new Error(error.message || 'Failed to add expense');
    }
}

// Function to delete an expense
async function deleteExpense(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete expense`);
    }
    
    return await response.json();
}

// Function to retry failed operations
async function retryOperation(operation, maxRetries = 3) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                continue;
            }
        }
    }
    throw lastError;
}

// Function to save expenses to local storage
function saveExpensesToLocal(expenses) {
    try {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (error) {
        console.error('Error saving to local storage:', error);
    }
}

// Function to load expenses from local storage
function loadExpensesFromLocal() {
    try {
        const savedExpenses = localStorage.getItem('expenses');
        return savedExpenses ? JSON.parse(savedExpenses) : [];
    } catch (error) {
        console.error('Error loading from local storage:', error);
        return [];
    }
}

// Load expenses and statistics from API
async function loadExpenses() {
    try {
        const [expenses, statistics] = await Promise.all([
            retryOperation(() => fetchExpenses()),
            retryOperation(() => fetchStatistics())
        ]);
        
        if (Array.isArray(expenses)) {
            displayExpenses(expenses);
        } else {
            showMessage('❌ Error: Invalid expenses data received', 'error');
        }
    } catch (error) {
        showMessage('❌ Error loading data: ' + error.message, 'error');
    }
}

// Form submission handler
document.getElementById("expenseForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    // Client-side validation
    const item = document.getElementById("item").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const person = document.getElementById("person").value;
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value.trim();
    
    // Validate required fields
    if (!item) {
        showMessage("❌ Item name is required", 'error');
        return;
    }
    if (isNaN(price) || price <= 0) {
        showMessage("❌ Price must be a positive number", 'error');
        return;
    }
    if (!person) {
        showMessage("❌ Please select a person", 'error');
        return;
    }
    if (!date) {
        showMessage("❌ Date is required", 'error');
        return;
    }
    if (note.length > 500) {
        showMessage("❌ Note must be less than 500 characters", 'error');
        return;
    }
    
    setLoading(true);
    
    const expense = { item, price, person, date, note };

    try {
        await addExpense(expense);
        showMessage("✅ Expense added successfully!");
        document.getElementById("expenseForm").reset();
        document.getElementById('date').value = new Date().toISOString().slice(0, 10);
        await Promise.all([
            loadExpenses(),
            fetchStatistics()
        ]);
    } catch (error) {
        showMessage("❌ " + error.message, 'error');
    } finally {
        setLoading(false);
    }
});

// Function to handle expense deletion
async function handleDeleteExpense(id) {
    if (!id || !confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        await retryOperation(() => deleteExpense(id));
        showMessage("✅ Expense deleted successfully!");
        await Promise.all([
            loadExpenses(),
            fetchStatistics()
        ]);
    } catch (error) {
        showMessage("❌ Error: " + error.message, 'error');
    }
}

// Function to display expenses
function displayExpenses(expenses) {
    const expensesList = document.getElementById("expensesList");
    if (!expensesList) return;

    expensesList.innerHTML = '';
    
    if (expenses.length === 0) {
        expensesList.innerHTML = '<p class="text-center text-muted">No expenses added yet.</p>';
        return;
    }
    
    saveExpensesToLocal(expenses);
    
    expenses.forEach(expense => {
        const div = document.createElement('div');
        div.className = 'expense-item';
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-danger';
        deleteButton.innerHTML = '<i class="bi bi-trash"></i> Delete';
        deleteButton.dataset.expenseId = expense._id;
        
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <p class="mb-1"><strong class="text-dark">${escapeHtml(expense.item)}</strong> - <span class="text-primary">₹${parseFloat(expense.price).toFixed(2)}</span></p>
                    <p class="mb-1 text-dark">Paid by: <span class="text-info">${escapeHtml(expense.person)}</span> | Date: <span class="text-secondary">${formatDate(expense.date)}</span></p>
                    ${expense.note ? `<p class="mb-1 text-dark">Note: <span class="text-muted">${escapeHtml(expense.note)}</span></p>` : ''}
                </div>
            </div>
        `;
        
        const flexContainer = div.querySelector('.d-flex');
        flexContainer.appendChild(deleteButton);
        deleteButton.addEventListener('click', () => handleDeleteExpense(expense._id));
        expensesList.appendChild(div);
    });
}

// Function to update statistics
function updateStatistics(statistics) {
    if (!statistics || typeof statistics !== 'object') {
        showMessage('❌ Error: Invalid statistics data received', 'error');
        return;
    }

    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        const total = typeof statistics.total === 'number' ? statistics.total : 0;
        totalElement.textContent = `₹${total.toFixed(2)}`;
    }

    const perPersonElement = document.getElementById('perPersonExpenses');
    if (perPersonElement) {
        const personStats = statistics.perPerson || {};
        const total = typeof statistics.total === 'number' ? statistics.total : 0;
        const allRoommates = ['Umakanta', 'Vikram', 'Somanath'];
        const averagePerPerson = total / allRoommates.length;

        let html = '';
        for (const person of allRoommates) {
            const amount = personStats[person] || 0;
            const difference = amount - averagePerPerson;
            const differenceText = difference > 0 
                ? `(Paid ₹${difference.toFixed(2)} extra)`
                : `(Owes ₹${Math.abs(difference).toFixed(2)})`;
            
            html += `
                <div class="mb-2">
                    <strong>${escapeHtml(person)}:</strong> ₹${amount.toFixed(2)}
                    <small class="text-muted">${differenceText}</small>
                </div>
            `;
        }
        perPersonElement.innerHTML = html || '<p class="text-muted">No expenses recorded yet</p>';
    }

    const settlementElement = document.getElementById('settlementDetails');
    if (settlementElement) {
        const splits = statistics.splits || [];
        if (splits.length > 0) {
            let html = '<div class="settlement-list">';
            splits.forEach(split => {
                html += `
                    <div class="settlement-item">
                        <i class="bi bi-arrow-right-circle text-primary"></i>
                        <span>${escapeHtml(split.from)}</span>
                        <i class="bi bi-arrow-right"></i>
                        <span>${escapeHtml(split.to)}</span>
                        <span class="amount">₹${split.amount.toFixed(2)}</span>
                    </div>
                `;
            });
            html += '</div>';
            settlementElement.innerHTML = html;
        } else {
            settlementElement.innerHTML = '<p class="text-muted">No settlements needed</p>';
        }
    }
}

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Function to escape HTML and prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('date').value = today;
    
    const localExpenses = loadExpensesFromLocal();
    if (localExpenses.length > 0) {
        displayExpenses(localExpenses);
    }
    
    loadExpenses();
}); 