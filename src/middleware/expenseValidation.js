const { body, validationResult } = require('express-validator');

const validateExpense = [
    body('item')
        .trim()
        .notEmpty()
        .withMessage('Item name is required')
        .isLength({ max: 100 })
        .withMessage('Item name must be less than 100 characters'),
    
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    
    body('person')
        .trim()
        .notEmpty()
        .withMessage('Person name is required')
        .isIn(['Umakanta', 'Vikram', 'Somanath'])
        .withMessage('Invalid person name'),
    
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),
    
    body('note')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Note must be less than 500 characters'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = validateExpense; 