const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');

// Route to add an expense
router.post('/add', expenseController.addExpense);

// Route to get expenses for a specific user
router.get('/user/:user_id', expenseController.getUserExpenses);

// Route to get overall expenses
router.get('/overall', expenseController.getOverallExpenses);

// Route to generate a balance sheet
router.get('/balance-sheet', expenseController.downloadBalanceSheet);

module.exports = router;
