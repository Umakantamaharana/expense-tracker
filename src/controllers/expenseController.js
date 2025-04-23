const Expense = require('../models/expense');

// Get all expenses
exports.getExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json({ status: 'success', data: expenses });
    } catch (error) {
        next(error);
    }
};

// Create new expense
exports.createExpense = async (req, res, next) => {
    try {
        const expense = new Expense(req.body);
        await expense.save();
        res.status(201).json({ status: 'success', data: expense });
    } catch (error) {
        next(error);
    }
};

// Delete expense
exports.deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            const error = new Error('Expense not found');
            error.statusCode = 404;
            throw error;
        }
        res.json({ status: 'success', data: expense });
    } catch (error) {
        next(error);
    }
};

// Get expense statistics
exports.getStatistics = async (req, res, next) => {
    try {
        const totalAmount = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$price' },
                    expensesByPerson: {
                        $push: {
                            person: '$person',
                            amount: '$price'
                        }
                    }
                }
            }
        ]);

        const personStats = {};
        const roommates = ['Umakanta', 'Vikram', 'Somanath'];
        
        // Initialize personStats with 0 for all roommates
        roommates.forEach(person => {
            personStats[person] = 0;
        });

        // Calculate total spent by each person
        if (totalAmount.length > 0) {
            totalAmount[0].expensesByPerson.forEach(expense => {
                personStats[expense.person] += expense.amount;
            });
        }

        // Calculate splits and who owes whom
        const total = totalAmount.length > 0 ? totalAmount[0].total : 0;
        const perPerson = total / roommates.length;
        
        const splits = [];
        const balances = {};
        roommates.forEach(person => {
            balances[person] = personStats[person] - perPerson;
        });

        // Calculate who owes whom
        roommates.forEach(person1 => {
            roommates.forEach(person2 => {
                if (person1 !== person2 && balances[person1] < 0 && balances[person2] > 0) {
                    const amount = Math.min(Math.abs(balances[person1]), balances[person2]);
                    if (amount > 0) {
                        splits.push({
                            from: person1,
                            to: person2,
                            amount: parseFloat(amount.toFixed(2))
                        });
                        balances[person1] += amount;
                        balances[person2] -= amount;
                    }
                }
            });
        });

        res.json({
            status: 'success',
            data: {
                total,
                personStats,
                splits,
                perPerson: parseFloat(perPerson.toFixed(2))
            }
        });
    } catch (error) {
        next(error);
    }
}; 