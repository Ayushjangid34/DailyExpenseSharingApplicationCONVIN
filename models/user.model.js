const db = require('../config/dbConnection');
const userModel = {
  create: userData => {
    return new Promise((resolve, reject) => {
      const { email, first_name, middle_name, last_name, mobile_number } =
        userData;
      const query = `INSERT INTO users (email, first_name, middle_name, last_name, mobile_number) VALUES (?, ?, ?, ?, ?)`;

      db.query(
        query,
        [email, first_name, middle_name, last_name, mobile_number],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        },
      );
    });
  },
  getByEmail: email => {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                            id,
                            email,
                            first_name,
                            middle_name,
                            last_name,
                            mobile_number,
                            DATE_FORMAT(joining, '%Y-%m-%dT%H:%i:%s') AS Joining,
                            DATE_FORMAT(last_update, '%Y-%m-%dT%H:%i:%s') AS Last_update
                            FROM users WHERE email = ?;`;
      db.query(query, [email], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null); // Resolve with null if no user found
        resolve(results[0]);
      });
    });
  },
  getById: id => {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                            id,
                            email,
                            first_name,
                            middle_name,
                            last_name,
                            mobile_number,
                            DATE_FORMAT(joining, '%Y-%m-%dT%H:%i:%s') AS Joining,
                            DATE_FORMAT(last_update, '%Y-%m-%dT%H:%i:%s') AS Last_update
                            FROM users WHERE id = ?;`;
      db.query(query, [id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null);
        resolve(results[0]);
      });
    });
  },
  getAllByIds: userIds => {
    return new Promise((resolve, reject) => {
      const query = `SELECT id FROM users WHERE id IN (?);`;
      db.query(query, [userIds], (err, results) => {
        if (err) {
          console.error('Error fetching users by IDs:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  },
  isMobileRegistered: mobile => {
    return new Promise((resolve, reject) => {
      const query = `SELECT id FROM users WHERE mobile_number = ?;`;
      db.query(query, mobile, (err, results) => {
        if (err) {
          console.error('Error fetching users by mobile :', err);
          return reject(err);
        }
        if (results.length === 0) return resolve(false);
        resolve(true);
      });
    });
  },
  isEmailRegistered: email => {
    return new Promise((resolve, reject) => {
      const query = `SELECT id FROM users WHERE email = ?;`;
      db.query(query, email, (err, results) => {
        if (err) {
          console.error('Error fetching users by Email :', err);
          return reject(err);
        }
        if (results.length === 0) return resolve(false);
        resolve(true);
      });
    });
  },
};

module.exports = userModel;
