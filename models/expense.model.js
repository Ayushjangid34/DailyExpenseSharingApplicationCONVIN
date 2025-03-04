const db = require('../config/dbConnection');

const expenseModel = {
  createExpense: async expenseData => {
    return new Promise((resolve, reject) => {
      const {
        user_id,
        title,
        description,
        expense_date_time,
        split_method,
        expenseAmount,
        participants,
      } = expenseData;

      // Begin the transaction
      db.beginTransaction(err => {
        if (err) return reject(err);

        const expenseQuery = `INSERT INTO expenses (title, description, date, split_method, total_amount, created_by) VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(
          expenseQuery,
          [
            title,
            description,
            expense_date_time,
            split_method,
            expenseAmount,
            user_id,
          ],
          (err, result) => {
            if (err) {
              return db.rollback(() => reject(err));
            }

            const expenseId = result.insertId;
            const participationsQuery = `INSERT INTO participations (user_id, expense_id, amount_owed) VALUES ?`;
            const participationsValues = participants.map(
              ({ participant_id, amount }) => [
                participant_id,
                expenseId,
                amount,
              ],
            );

            db.query(participationsQuery, [participationsValues], err => {
              if (err) {
                return db.rollback(() => reject(err));
              }

              // Commit the transaction
              db.commit(err => {
                if (err) {
                  return db.rollback(() => reject(err));
                }
                resolve(expenseId);
              });
            });
          },
        );
      });
    });
  },
  getUserExpenses: async (userId, date) => {
    return new Promise((resolve, reject) => {
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
                    p.user_id = ?
            `;
      const queryParams = [userId];

      if (date) {
        query += ' AND DATE(e.date) = ?';
        queryParams.push(date);
      }

      query += ' ORDER BY e.date ASC;';

      db.query(query, queryParams, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  },
  getExpenses: async date => {
    return new Promise((resolve, reject) => {
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

      db.query(expenseQuery, [date], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  },
  getUserSummary: async date => {
    return new Promise((resolve, reject) => {
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

      db.query(userSummaryQuery, [date], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  },
  getOverallExpenses: async (date, user_id) => {
    return new Promise((resolve, reject) => {
      const overallExpensesQuery = `
            SELECT DISTINCT
                e.id AS expense_id,
                e.title,
                e.description,
                DATE_FORMAT(e.date, '%Y-%m-%dT%H:%i:%s') AS expense_date,
                 e.date,
                e.total_amount,
                e.split_method
            FROM
                expenses e
            INNER JOIN
                participations p
            ON
                e.id = p.expense_id
            WHERE
                1 =1 
                ${date ? 'AND DATE(e.date) = ?' : ''}
                ${user_id ? 'AND p.user_id = ?' : ''}
            ORDER BY
                e.date ASC;

            `;

      const params = [];
      if (date) params.push(date);
      if (user_id) params.push(user_id);

      db.query(overallExpensesQuery, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  },
  getIndividualExpenses: async (date, user_id) => {
    return new Promise((resolve, reject) => {
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
            WHERE
                1 =1 
                ${date ? 'AND DATE(e.date) = ?' : ''}
                ${user_id ? 'AND p.user_id = ?' : ''}
            ORDER BY
              u.id, e.date ASC;
          `;

      const params = [];
      if (date) params.push(date);
      if (user_id) params.push(user_id);

      db.query(individualExpensesQuery, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  },
};

module.exports = expenseModel;
