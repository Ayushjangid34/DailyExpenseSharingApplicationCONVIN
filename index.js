const express = require('express');
const app = express();
const port = 3000;
const ExcelJS = require('exceljs');

// Importing the database connection
const db = require('./dbConnection');

// Middleware to parse JSON requests
app.use(express.json());

const validateMobileNumber = (number) => {
    const mobileRegex = /^[7-9][0-9]{9}$/; //Numbers starting with 0 is assigned for STD calls. Numbers starting from 2-6 is for landlines. So the left over i.e 7-9 is for mobile that we are considering in our application
    return mobileRegex.test(number);
  };

  const validateEmail = (email) => {
    const emailRegex =/^([a-zA-Z\d\.-]+)@([a-zA-Z\d-]+)\.([a-zA-Z]{2,8})(\.[a-zA-Z]{2,8})?$/;
    return emailRegex.test(email);
  };


// Defining a route to create a new user
app.post('/createUser', (req, res) => {
    const { email, first_name, middle_name, last_name, mobile_number } = req.body;

    console.log(email);
  
    // Input validation
    if (!email || !first_name || !last_name || !mobile_number) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Mobile Number validation
    if ( !validateMobileNumber(mobile_number)) {
        return res.status(400).json({ error: 'Incorrect Mobile Number' });
    }

    // Email validation
    if ( !validateEmail(email)) {
        return res.status(400).json({ error: 'Incorrect Email' });
    }
  
    const query = `INSERT INTO users (email, first_name, middle_name, last_name, mobile_number)
      VALUES (?, ?, ?, ?, ?)`;
  
      db.query(query, [email, first_name, middle_name, last_name, mobile_number], (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId });
      });
  });


// Defining a GET route to retrieve user details using user email
// This will work using both email and id for user details retrieval, but id is prioritized over email. If both email and id are provided in the request parameters and if the id is incorrect, the API will not respond, even if the email is correct.
app.get('/user/info', (req, res) => {
    const { email, id } = req.query;
    // query that can be modified according to Email or ID
    let query = `SELECT 
    id,
    email,
    first_name,
    middle_name,
    last_name,
    mobile_number,
    DATE_FORMAT(joining, '%Y-%m-%dT%H:%i:%s') AS Joining,
    DATE_FORMAT(last_update, '%Y-%m-%dT%H:%i:%s') AS Last_update
FROM users WHERE `
    let queryParam = [];
    if( id ){
        if( isNaN(id) ){
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        query += 'id = ?;';
        queryParam.push(id);
    } else if (email) {
         // Email validation
        if ( !validateEmail(email)) {
            return res.status(400).json({ error: 'Incorrect Email' });
        }
        query += 'email = ?;';
        queryParam.push(email);
    } else return res.status(400).json({ error: 'Either email or id is required' });
    db.query(query, queryParam, (err, results) => {
        if (err) {
            console.error('Error retrieving user details:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(results[0]);
    });
});

//Route for retrieving individual user expenses
app.get('/user/:user_id/expenses', (req, res) => {
    const userId = req.params.user_id;
    const { date } = req.query;
    let query = `
        SELECT 
                e.id AS expense_id,
                e.title,
                e.description,
                DATE_FORMAT(e.date, '%Y-%m-%dT%H:%i:%s') AS expense_date,
                e.split_method,
                e.total_amount,
                p.amount_owed
        FROM 
            expenses e
        JOIN 
            participations p ON e.id = p.expense_id
        WHERE 
            p.user_id = ? `;
    let queryP = [];
    queryP.push(userId);
    //checking whether date is provided or not and if yes, validating the provided date
    console.log(date);
    if (date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Regular expression for valid date in YYYY-MM-DD format
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Expected format: YYYY-MM-DD' });
        }
        try {
            const dateValue = new Date(date);
            const dateTest = new Date(date + 'T00:00:00.000Z').toISOString().split('T')[0];
            if( dateTest !== date )
                return res.status(400).json({ error: 'Invalid date value.' });
            // Check if the date is in the future
            if (new Date(new Date().toLocaleDateString()) < new Date(new Date(dateValue).toLocaleDateString()))
                return res.status(400).json({ error: 'Future Date is not allowed!' });
        } catch (error) {
            console.error('Date validation error:', error);
            return res.status(400).json({ error: 'Invalid date value.' });
        }
        query += "AND DATE(e.date) = ?"
        queryP.push(date);
    }
    query += " ORDER BY e.date ASC;";
    db.query(query, queryP, (err, results) => {
        if (err) {
            console.error('Error retrieving expenses for user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json(results);
    });
});



//Route for retrieving overall expenses( For every user )
app.get('/expenses/overall', (req, res) => {
    const { date } = req.query;
    if (date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Regular expression for valid date in YYYY-MM-DD format
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Expected format: YYYY-MM-DD' });
        } 
        try {
            const dateValue = new Date(date);
            const dateTest = new Date(date + 'T00:00:00.000Z').toISOString().split('T')[0];
            if( dateTest !== date )
                return res.status(400).json({ error: 'Invalid date value.' });
            // Check if the date is in the future
            if (new Date(new Date().toLocaleDateString()) < new Date(new Date(dateValue).toLocaleDateString()))
                return res.status(400).json({ error: 'Future Date is not allowed!' });
        } catch (error) {
            console.error('Date validation error:', error);
            return res.status(400).json({ error: 'Invalid date value.' });
        }
    }
    // Queries with or without date filter
    const expenseQuery = `
        SELECT
            e.id AS expense_id,
            e.title,
            e.description,
            DATE_FORMAT(e.date, '%Y-%m-%dT%H:%i:%s') AS expense_date,
            e.total_amount,
            e.split_method
        FROM
            expenses e
        ${date ? 'WHERE DATE(e.date) = ?' : ''}
        ORDER BY
            e.date ASC;
    `;

    const userSummaryQuery = `
        SELECT
            u.id AS user_id,
            u.email,
            COALESCE(SUM(p.amount_owed), 0) AS total_amount_owed
        FROM
            users u
        LEFT JOIN
            participations p ON u.id = p.user_id
        LEFT JOIN
            expenses e ON p.expense_id = e.id
        ${date ? 'WHERE DATE(e.date) = ?' : ''}
        GROUP BY
            u.id, u.email;
    `;

    // preparing query parameters
    const queryParams = date ? [date] : [];
    db.query(expenseQuery, queryParams, (err, expenseResults) => {
        if (err) {
            console.error('Error retrieving expenses:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Execute the user summary query
        db.query(userSummaryQuery, queryParams, (err, userSummaryResults) => {
            if (err) {
                console.error('Error retrieving user summaries:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Calculating the total amount spent
            const totalAmountSpent = expenseResults.reduce((sum, exp) => sum + parseFloat(exp.total_amount), 0);
            
            res.json({
                overall_summary: {
                    total_expenses: expenseResults.length,
                    total_amount_spent: totalAmountSpent
                },
                expenses: expenseResults,
                user_summary: userSummaryResults
            });
        });
    });
});

// Endpoint to add expeses
app.post('/expenses/add', (req, res) => {
    const { user_id, expenseAmount, title, description, expense_date_time, split_method, participants } = req.body;
    let expenseDateTime;

    // Input validation
    if (!user_id || (!expenseAmount && expenseAmount != 0) || !title || !split_method || !participants) {
        return res.status(400).json({ error: 'Required fields are missing' });
    }
    if (participants.length == 0) {
        return res.status(400).json({ error: 'At least one participant is required!' });
    }

    //checking whether date is provided or not and if yes, validating the provided date
    if (expense_date_time) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/; // Regular expression for valid date-time format without 'Z'
        if (!dateRegex.test(expense_date_time)) {
            return res.status(400).json({ error: 'Invalid date-time format. Expected format: YYYY-MM-DDTHH:mm:ss' });
        }
        try {
            const expenseDateTime = new Date(expense_date_time); // Converting local time to UTC
            const dateTest = new Date(expense_date_time + 'Z').toISOString().split('.')[0]; // converting to user provided local time to check validity of user provided time
            
            if (dateTest !== expense_date_time) {
                return res.status(400).json({ error: 'Invalid Date-time!' });
            }
            
            // Check if the date is in the future
            if (new Date() < expenseDateTime) {
                return res.status(400).json({ error: 'Future Date is not allowed!' });
            }
        } catch (error) {
            console.error('Date-time validation error:', error);
            return res.status(400).json({ error: 'Invalid date-time value.' });
        }
    }

    const validMethods = ['equal', 'exact', 'percentage'];
    if (!validMethods.includes(split_method)) {
        return res.status(400).json({ error: 'Invalid split method' });
    }

    const amountRegex = /^\d{1,10}(\.\d{1,3})?$/;
    if (isNaN(expenseAmount) || !amountRegex.test(expenseAmount)) {
        return res.status(400).json({ error: 'Invalid amount. Please enter a positive number with up to 10 digits and up to 3 decimal places.' });
    }
    const amountValue = parseFloat(expenseAmount);
    if (amountValue <= 0) {
        return res.status(400).json({ error: 'Negative or zero amount is not allowed.' });
    }

    //checking for a valid user ID
    if (isNaN(user_id) ) {
        return res.status(400).json({ error: 'Incorrect user_id!' });
    }

    //Checking whether all the participant ID's and split value is correct(Number) or not
    participants.forEach(participant => {
        if (isNaN(participant.participant_id) || (isNaN(participant.split_value) && split_method !== "equal")) {
            return res.status(400).json({ error: 'Incorrect participant ID or split value!' });
        }
        if (!amountRegex.test(participant.split_value) && split_method !== "equal") {
            return res.status(400).json({ error: 'Invalid Split Value!' });
        }
        if ( split_method === "percentage" && participant.split_value > 100) {
            return res.status(400).json({ error: 'Split value cannot exceed 100% while using percentage split method !' });
        }
    });

    //checking whether the creator of Split/Expenses participates or not 
    if (!participants.some(participant => participant.participant_id === user_id)) {
        return res.status(400).json({ error: 'The creator of the expenses must participate!' });
    }

    // Checking whether all participant IDs are unique
    const participantIds = participants.map(participant => participant.participant_id);
    const uniqueParticipantIds = new Set(participantIds);
    if (uniqueParticipantIds.size !== participantIds.length) {
        return res.status(400).json({ error: 'Duplicate participant IDs are not allowed!' });
    }

    const split = []; // Array to store participants with their associated calculated amounts

    // Validation for percentage split and distributing amount
    if (split_method === 'percentage') {
        const totalPercentage = participants.reduce((sum, p) => sum + parseFloat(p.split_value), 0);
        if (totalPercentage !== 100) {
            return res.status(400).json({ error: `Total percentage split must equal 100%, not ${totalPercentage}%` });
        }

        let totalSum = 0;
        participants.forEach(participant => {
            const participantAmount = Math.floor(amountValue * (parseFloat(participant.split_value) / 100) * 1000) / 1000;
            if (participantAmount <= 0) {
                return res.status(400).json({ error: 'The amount is too small to be split!' });
            }
            totalSum += participantAmount;
            split.push({
                participant_id: participant.participant_id,
                amount: participantAmount
            });
        });

         // Sometimes, due to fractional calculation errors, there may be a small discrepancy in the total amount.
        let minAmountParticipant = split.reduce((min, current) => current.amount < min.amount ? current : min, split[0]); // this line finds the participant with minimum split amount
        minAmountParticipant.amount += amountValue - totalSum; // This code adjusts the discrepancy amount for the participant who has minimum split amount to avoid any rounding errors.
    }

    if (split_method === 'equal') {
        const numberOfParticipants = participants.length;
        const equalShare = Math.floor((amountValue / numberOfParticipants) * 1000) / 1000;
        const totalShare = equalShare * numberOfParticipants;

        if (totalShare <= 0) {
            return res.status(400).json({ error: 'The amount is too small to be split equally!' });
        }

        participants.forEach(participant => {
            split.push({
                participant_id: participant.participant_id,
                amount: equalShare
            });
        });

        // Adjusting discrepancy
        let minAmountParticipant = split.reduce((min, current) => current.amount < min.amount ? current : min, split[0]);
        minAmountParticipant.amount += amountValue - totalShare;
    }

    if (split_method === 'exact') {
        let totalExactAmount = 0;
        participants.forEach(participant => {
            const participantAmount = parseFloat(participant.split_value);
            if (!amountRegex.test(participantAmount) || participantAmount <= 0) {
                return res.status(400).json({ error: 'Invalid exact amount specified!' });
            }
            totalExactAmount += participantAmount;
            split.push({
                participant_id: participant.participant_id,
                amount: participantAmount
            });
        });

        if (totalExactAmount !== amountValue) {
            return res.status(400).json({ error: `Total exact amounts must equal the total expense amount of ${amountValue}.` });
        }
    }
    //console.log(expenseDateTime);    Used for debuging purpose
     //console.log(expense_date_time);   .............
    // Inserting the data into database using Transactions so that if any problem occurs it can be rolled back
    db.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ error: 'Internal Server Error while starting transaction' });
        }

        // Inserting the expense into the expenses table
        const expenseQuery = `INSERT INTO expenses (title, description, date, split_method, total_amount, created_by) VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(expenseQuery, [title, description, expense_date_time, split_method, amountValue, user_id], (err, results) => {
            if (err) {
                return db.rollback(() => {
                    console.error('Error adding expense:', err);
                    return res.status(500).json({ error: 'Internal Server Error while adding expense' });
                });
            }

            const expenseId = results.insertId;

            // Preparing insertions into the participations table
            const participationsQuery = `INSERT INTO participations (user_id, expense_id, amount_owed) VALUES ?`;
            const participationsValues = split.map(({ participant_id, amount }) => [participant_id, expenseId, amount]);

            // Inserting participations
            db.query(participationsQuery, [participationsValues], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error adding participations:', err);
                        return res.status(500).json({ error: 'Internal Server Error while adding participations' });
                    });
                }

                // Commit the transaction
                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error committing transaction:', err);
                            return res.status(500).json({ error: 'Internal Server Error while committing transaction' });
                        });
                    }
                    res.status(201).json({ ExpenseID: expenseId });
                });
            });
        });
    });
});

// Route to generate and download balance sheet
app.get('/expenses/balance-sheet', async (req, res) => {
    const { date } = req.query;

    //Date Validation
    if (date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Regular expression for valid date in YYYY-MM-DD format
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Expected format: YYYY-MM-DD' });
        } 
        try {
            const dateValue = new Date(date);
            const dateTest = new Date(date + 'T00:00:00.000Z').toISOString().split('T')[0];
            if( dateTest !== date )
                return res.status(400).json({ error: 'Invalid date value.' });
            // Check if the date is in the future
            if (new Date(new Date().toLocaleDateString()) < new Date(new Date(dateValue).toLocaleDateString()))
                return res.status(400).json({ error: 'Future Date-time is not allowed!' });
        } catch (error) {
            console.error('Date validation error:', error);
            return res.status(400).json({ error: 'Invalid date value.' });
        }
    }

    // Construct the queries with conditional date filtering
    const individualExpensesQuery = `
      SELECT
        u.id AS user_id,
        u.email,
        e.id AS expense_id,
        e.title,
        e.description,
        DATE_FORMAT(e.date, '%Y-%m-%dT%H:%i:%s') AS expense_date,
        p.amount_owed
      FROM
        users u
      JOIN
        participations p ON u.id = p.user_id
      JOIN
        expenses e ON p.expense_id = e.id
      ${date ? 'WHERE DATE(e.date) = ?' : ''}
      ORDER BY
        u.id, e.date ASC;
    `;
  
    const overallExpensesQuery = `
      SELECT
        e.id AS expense_id,
        e.title,
        e.description,
        DATE_FORMAT(e.date, '%Y-%m-%dT%H:%i:%s') AS expense_date,
        e.total_amount,
        e.split_method
      FROM
        expenses e
      ${date ? 'WHERE DATE(e.date) = ?' : ''}
      ORDER BY
        e.date ASC;
    `;

    try {
        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const individualSheet = workbook.addWorksheet('Individual Expenses');
        const overallSheet = workbook.addWorksheet('Overall Expenses');

        // Set parameters for the queries
        const queryParams = date ? [date] : [];

        // Execute both queries
        const [individualResults, overallResults] = await Promise.all([
            db.promise().query(individualExpensesQuery, queryParams),
            db.promise().query(overallExpensesQuery, queryParams)
        ]);

        // Add headers and rows for Individual Expenses
        individualSheet.addRow(['User ID', 'Email', 'Expense ID', 'Title', 'Description', 'Expense Date', 'Amount Owed']);
        individualResults[0].forEach(row => {
            individualSheet.addRow([
                row.user_id,
                row.email,
                row.expense_id,
                row.title,
                row.description,
                row.expense_date,
                row.amount_owed
            ]);
        });

        // Add headers and rows for Overall Expenses
        overallSheet.addRow(['Expense ID', 'Title', 'Description', 'Expense Date', 'Total Amount', 'Split Method']);
        overallResults[0].forEach(row => {
            overallSheet.addRow([
                row.expense_id,
                row.title,
                row.description,
                row.expense_date,
                row.total_amount,
                row.split_method
            ]);
        });

        // Write the Excel file to a buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Set headers and send the file
        const fileName = date ? `balance-sheet-for-${date}.xlsx` : 'balance-sheet.xlsx';
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error('Error generating balance sheet:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Starting the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

module.exports = app;
