const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    person: {
        type: String,
        required: true,
        enum: ['Umakanta', 'Vikram', 'Somanath']
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    note: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema); 