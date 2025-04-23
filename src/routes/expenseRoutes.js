const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const validateExpense = require('../middleware/expenseValidation');

// Get all expenses
router.get('/', expenseController.getExpenses);

// Create new expense
router.post('/', validateExpense, expenseController.createExpense);

// Delete expense
router.delete('/:id', expenseController.deleteExpense);

// Get expense statistics
router.get('/statistics', expenseController.getStatistics);

module.exports = router; 