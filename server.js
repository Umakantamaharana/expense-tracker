const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust proxy - important when behind a reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            objectSrc: ["'none'"],
            mediaSrc: ["'none'"],
            frameSrc: ["'none'"],
        },
    },
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Handle MongoDB connection errors
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Import Expense model
const Expense = require('./src/models/expense');

// Create new expense
app.post('/api/expenses', async (req, res) => {
    try {
        const { item, price, person, note } = req.body;
        
        // Validate required fields
        if (!item || !price || !person) {
            return res.status(400).json({
                error: 'Missing required fields: item, price, and person are required'
            });
        }

        // Validate price is a number
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice < 0) {
            return res.status(400).json({
                error: 'Price must be a positive number'
            });
        }

        // Validate person name
        const validPersons = ['Umakanta', 'Vikram', 'Somanath'];
        if (!validPersons.includes(person)) {
            return res.status(400).json({
                error: 'Invalid person name. Must be one of: Umakanta, Vikram, Somanath'
            });
        }

        // Create new expense
        const expense = new Expense({
            item,
            price: numericPrice,
            person,
            note: note || '',
            date: new Date()
        });

        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        console.error('Error creating expense:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// Get all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// Get statistics
app.get('/api/statistics', async (req, res) => {
    try {
        // Get current month's start and end dates
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Find expenses for current month only
        const expenses = await Expense.find({
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });
        
        // Initialize default values with proper structure
        const response = {
            total: 0,
            perPerson: {},
            splits: [],
            month: now.toLocaleString('default', { month: 'long', year: 'numeric' })
        };
        
        // Define all roommates
        const allRoommates = ['Umakanta', 'Vikram', 'Somanath'];
        
        // Initialize perPerson with 0 for all roommates
        allRoommates.forEach(person => {
            response.perPerson[person] = 0;
        });
        
        if (expenses && expenses.length > 0) {
            // Calculate total
            response.total = expenses.reduce((sum, expense) => {
                const price = parseFloat(expense.price) || 0;
                return sum + price;
            }, 0);

            // Calculate per person expenses
            expenses.forEach(expense => {
                if (expense.person) {
                    const price = parseFloat(expense.price) || 0;
                    response.perPerson[expense.person] += price;
                }
            });

            // Calculate splits
            const balances = {};
            Object.keys(response.perPerson).forEach(person => {
                balances[person] = response.perPerson[person];
            });

            const totalAmount = Object.values(balances).reduce((sum, amount) => sum + amount, 0);
            const averagePerPerson = totalAmount / allRoommates.length;

            // Calculate who owes whom
            const debtors = [];
            const creditors = [];

            Object.entries(balances).forEach(([person, balance]) => {
                const difference = balance - averagePerPerson;
                if (difference < 0) {
                    debtors.push({ person, amount: Math.abs(difference) });
                } else if (difference > 0) {
                    creditors.push({ person, amount: difference });
                }
            });

            // Sort by amount (descending)
            debtors.sort((a, b) => b.amount - a.amount);
            creditors.sort((a, b) => b.amount - a.amount);

            // Calculate settlements
            let debtorIndex = 0;
            let creditorIndex = 0;

            while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
                const debtor = debtors[debtorIndex];
                const creditor = creditors[creditorIndex];
                const amount = Math.min(debtor.amount, creditor.amount);

                if (amount > 0) {
                    response.splits.push({
                        from: debtor.person,
                        to: creditor.person,
                        amount: parseFloat(amount.toFixed(2))
                    });

                    debtor.amount -= amount;
                    creditor.amount -= amount;
                }

                if (debtor.amount === 0) debtorIndex++;
                if (creditor.amount === 0) creditorIndex++;
            }
        }

        res.json(response);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Reset all expenses
app.post('/api/reset', async (req, res) => {
    try {
        // Delete all expenses from the database
        await Expense.deleteMany({});
        res.json({ message: 'All expenses have been reset successfully' });
    } catch (error) {
        console.error('Error resetting expenses:', error);
        res.status(500).json({ error: 'Failed to reset expenses' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 