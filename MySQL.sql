DROP DATABASE  IF EXISTS DailyExpSharingApp; -- I had to delete the database while testing
CREATE DATABASE DailyExpSharingApp;
USE DailyExpSharingApp;
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(10) UNIQUE NOT NULL, -- RN only indian users are considered
    joining DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- This column can be used when user update his/her information to show the updation date
    -- Password can also be stored here in hashed formate if we want autentication
);


-- SQL command to create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    split_method ENUM('equal', 'exact', 'percentage'),
    total_amount DECIMAL(13, 3) NOT NULL,  -- Value upto 9999999999.999 can be stored
    created_by INT, -- The usedID who created this expense split
    FOREIGN KEY (created_by) REFERENCES users(id)
);



-- SQL command to create Participations Table
CREATE TABLE IF NOT EXISTS participations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    expense_id INT NOT NULL,
    amount_owed DECIMAL(13, 3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);