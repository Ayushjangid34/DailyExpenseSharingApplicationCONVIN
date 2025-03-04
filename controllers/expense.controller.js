const { calculateSplitAmount } = require('../utils/splitHelper');
const expenseModel = require('../models/expense.model');
const { validateDate, validateDateTime, validateParticipations, amountRegex } = require('../utils/validator');
const { handleError } = require('../utils/errorHandler');
const user = require('../models/user.model');
const ExcelJS = require('exceljs');

exports.addExpense = async (req, res) => {
  const {
    user_id,
    expenseAmount,
    title,
    description,
    expense_date_time,
    split_method,
    participants,
  } = req.body;

  try {
    const requiredFields = [
      !user_id,
      !expenseAmount,
      !title,
      !split_method,
      !participants,
      !expense_date_time,
    ];
    if (requiredFields.filter(Boolean).length >= 2)
      return handleError(res, { code: 'MISSING_FIELDS' });
    if (!user_id) return handleError(res, { code: 'MISSING_CREATOR_ID' });
    if (!expenseAmount)
      return handleError(res, { code: 'MISSING_EXPENSE_AMOUNT' });
    if (!title) return handleError(res, { code: 'MISSING_TITLE' });
    if (!split_method)
      return handleError(res, { code: 'MISSING_SPLIT_METHOD' });
    if (!participants)
      return handleError(res, { code: 'MISSING_PARTICIPANTS_ARRAY' });
    if (!expense_date_time)
      return handleError(res, { code: 'MISSING_EXPENSE_DATE_TIME' });

    if (participants.length === 0)
      return handleError(res, { code: 'MISSING_PARTICIPANTS' });

    const validMethods = ['equal', 'exact', 'percentage'];
    if (!validMethods.includes(split_method))
      return handleError(res, { code: 'INVALID_SPLIT_METHOD' });

    if (!(await user.getById(user_id)))
      return handleError(res, { code: 'USER_NOT_FOUND' });

    if (!amountRegex.test(expenseAmount) || expenseAmount <= 0)
      return handleError(res, { code: 'INVALID_EXPENSE_AMOUNT' });

    // Checking whether the creator of Split/Expenses participates or not
    if ( !participants.some(participant => participant.participant_id === user_id))
      return handleError(res, { code: 'CREATOR_MUST_PARTICIPATE' });

    // Checking whether all participant IDs are unique
    const participantIds = participants.map(
      participant => participant.participant_id,
    );
    const uniqueParticipantIds = new Set(participantIds);
    if (uniqueParticipantIds.size !== participantIds.length) {
      return handleError(res, { code: 'DUPLICATE_PARTICIPANTS' });
    }

    // Validate the date-time format
    await validateDateTime(expense_date_time);

    // Validating participants based on the split method
    await validateParticipations(participants, participantIds, split_method);

    // Calculate the split amounts for the participants
    const split = await calculateSplitAmount(
      split_method,
      expenseAmount,
      participants,
    );

    // Inserting the expense into the database using the model
    const expenseData = {
      user_id,
      title,
      description,
      expense_date_time,
      split_method,
      expenseAmount,
      participants: split.participants,
    };

    const expenseId = await expenseModel.createExpense(expenseData);
    res.status(201).json({ ExpenseID: expenseId });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getUserExpenses = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const { date } = req.query;

    // Validate userId
    if (!userId) {
      return handleError(res, { code: 'MISSING_USER_ID' });
    }

    if (!(await user.getById(userId))) {
      return handleError(res, { code: 'USER_NOT_FOUND' });
    }

    // Validate the optional date parameter
    if (date) await validateDate(date);

    // Fetch data using the model
    const expenses = await expenseModel.getUserExpenses(userId, date);

    // Respond with the retrieved data
    res.status(200).json(expenses);
  } catch (err) {
    handleError(res, err);
  }
};

exports.getOverallExpenses = async (req, res) => {
  const { date } = req.query;

  // Validate the optional date parameter
  try {
    if (date) await validateDate(date);
    const expenses = await expenseModel.getExpenses(date);
    const userSummary = await expenseModel.getUserSummary(date);

    const totalAmountSpent = expenses.reduce(
      (sum, exp) => sum + parseFloat(exp.total_amount),
      0,
    );

    res.json({
      overall_summary: {
        total_expenses: expenses.length,
        total_amount_spent: totalAmountSpent,
      },
      expenses,
      user_summary: userSummary,
    });
  } catch (err) {
    handleError(res, err);
  }
};

exports.downloadBalanceSheet = async (req, res) => {
  const { date } = req.query;
  const { id } = req.query;
  // Validate the optional date parameter
  try {
    // Fetch data from the database
    if (date) await validateDate(date);
    if (id)
      if (!(await user.getById(id)))
        return handleError(res, { code: 'USER_NOT_FOUND' });

    const [individualResults, overallResults] = await Promise.all([
      expenseModel.getIndividualExpenses(date, id),
      expenseModel.getOverallExpenses(date, id),
    ]);

    // Create a new workbook and worksheets
    const workbook = new ExcelJS.Workbook();
    const individualSheet = workbook.addWorksheet('Individual Expenses');
    const overallSheet = workbook.addWorksheet('Overall Expenses');

    // Add headers and rows for Individual Expenses
    individualSheet.addRow([
      'User ID',
      'Email',
      'Expense ID',
      'Title',
      'Description',
      'Expense Date',
      'Amount Owed',
    ]);
    individualResults.forEach(row => {
      individualSheet.addRow([
        row.user_id,
        row.email,
        row.expense_id,
        row.title,
        row.description,
        row.expense_date,
        row.amount_owed,
      ]);
    });

    // Add headers and rows for Overall Expenses
    overallSheet.addRow([
      'Expense ID',
      'Title',
      'Description',
      'Expense Date Time',
      'Total Amount',
      'Split Method',
    ]);
    overallResults.forEach(row => {
      overallSheet.addRow([
        row.expense_id,
        row.title,
        row.description,
        row.expense_date,
        row.total_amount,
        row.split_method,
      ]);
    });

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers and send the file
    const fileName = date
      ? `balance-sheet-for-${date}.xlsx`
      : 'balance-sheet.xlsx';
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  } catch (err) {
    handleError(res, err);
  }
};
