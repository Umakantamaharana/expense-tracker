// API endpoint
const API_URL = window.location.hostname === 'localhost' 
    ? '/api/expenses'
    : 'https://your-backend-url.onrender.com/api/expenses';

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
        
        // Validate and normalize data structure
        const normalizedData = {
            total: 0,
            perPerson: {},
            splits: []
        };

        // Normalize total
        if (typeof data.total === 'number') {
            normalizedData.total = data.total;
        } else if (typeof data.total === 'string') {
            normalizedData.total = parseFloat(data.total) || 0;
        }

        // Normalize perPerson
        if (data.perPerson && typeof data.perPerson === 'object') {
            Object.entries(data.perPerson).forEach(([person, amount]) => {
                normalizedData.perPerson[person] = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
            });
        }

        // Normalize splits
        if (Array.isArray(data.splits)) {
            normalizedData.splits = data.splits.filter(split => 
                split && 
                typeof split.from === 'string' && 
                typeof split.to === 'string' && 
                (typeof split.amount === 'number' || typeof split.amount === 'string')
            ).map(split => ({
                from: split.from,
                to: split.to,
                amount: typeof split.amount === 'number' ? split.amount : parseFloat(split.amount) || 0
            }));
        }

        updateStatistics(normalizedData);
    } catch (error) {
        showMessage('❌ Error loading statistics: ' + error.message, 'error');
    }
}

// Function to add a new expense
async function addExpense(expense) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                item: expense.item,
                price: parseFloat(expense.price),
                person: expense.person,
                date: expense.date,
                note: expense.note
            })
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
    
    const result = await response.json();
    return result;
}

// Function to show messages
function showMessage(message, type = 'success') {
    const messageElement = document.getElementById("message");
    messageElement.innerText = message;
    messageElement.className = `text-center mt-3 mb-4 ${type === 'error' ? 'text-danger' : 'text-success'}`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageElement.innerText = '';
            messageElement.className = 'text-center mt-3 mb-4';
        }, 3000);
    }
}

// Set default date to today when page loads
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('date').value = today;
    loadExpenses();
});

// Load expenses and statistics from API
async function loadExpenses() {
    try {
        const [expenses, statistics] = await Promise.all([
            fetchExpenses(),
            fetchStatistics()
        ]);
        
        // Ensure we have valid data before updating the UI
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
    setLoading(true);
  
    const expense = {
        item: document.getElementById("item").value.trim(),
        price: parseFloat(document.getElementById("price").value),
        person: document.getElementById("person").value,
        date: document.getElementById("date").value,
        note: document.getElementById("note").value.trim()
    };

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
        await deleteExpense(id);
        showMessage("✅ Expense deleted successfully!");
        // Reload both expenses and statistics
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
        
        // Add delete button to the flex container
        const flexContainer = div.querySelector('.d-flex');
        flexContainer.appendChild(deleteButton);
        
        // Add delete event listener
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

    // Update total amount
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        const total = typeof statistics.total === 'number' ? statistics.total : 0;
        totalElement.textContent = `₹${total.toFixed(2)}`;
    }

    // Update per person expenses
    const perPersonElement = document.getElementById('perPersonExpenses');
    if (perPersonElement) {
        const personStats = statistics.perPerson || {};
        const total = typeof statistics.total === 'number' ? statistics.total : 0;
        const personCount = Object.keys(personStats).length || 1;
        const perPerson = total / personCount;

        let html = '';
        for (const [person, amount] of Object.entries(personStats)) {
            if (typeof amount === 'number') {
                const difference = amount - perPerson;
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
        }
        perPersonElement.innerHTML = html || '<p class="text-muted">No expenses recorded yet</p>';
    }

    // Update settlement details
    const settlementElement = document.getElementById('settlementDetails');
    if (settlementElement) {
        if (!Array.isArray(statistics.splits) || statistics.splits.length === 0) {
            settlementElement.innerHTML = '<p class="text-muted">No settlements needed</p>';
            return;
        }

        let html = '<div class="settlement-list">';
        statistics.splits.forEach(split => {
            if (split && typeof split.amount === 'number') {
                html += `
                    <div class="settlement-item">
                        <i class="bi bi-arrow-right-circle text-primary"></i>
                        <strong>${escapeHtml(split.from)}</strong> owes 
                        <strong>${escapeHtml(split.to)}</strong>
                        <span class="amount">₹${split.amount.toFixed(2)}</span>
                    </div>
                `;
            }
        });
        html += '</div>';
        settlementElement.innerHTML = html;
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

// Initial fetch of statistics
fetchStatistics(); 