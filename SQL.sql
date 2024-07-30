CREATE DATABASE IF NOT EXISTS DailyExpSharingApp;
-- DROP DATABASE DailyExpSharingApp; -- I had to delete the database while testing
USE DailyExpSharingApp;
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(10) UNIQUE NOT NULL, -- RN only indian users are considered
    joining DATETIME NOT NULL,
    last_update DATETIME NOT NULL -- This column can be used when user update his/her information to show the updation date
    -- Password also can be stored here in hashed formate if we want autentication
);

-- Dropping the triggers if they are already present due to last partial script run
DROP TRIGGER IF EXISTS update_user_joining;
DROP TRIGGER IF EXISTS update_user_last_update;

-- Trigger for user creation
DELIMITER //
CREATE TRIGGER update_user_joining
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    SET NEW.joining = NOW();
    SET NEW.last_update = NOW();
END;

-- Trigger for user data updatation
CREATE TRIGGER update_user_last_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.last_update = NOW();
END;
// DELIMITER ;

-- SQL command to create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
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

-- Trigger for using default date if not provided !
DELIMITER //

CREATE TRIGGER set_default_date_before_insert
BEFORE INSERT ON expenses
FOR EACH ROW
BEGIN
    IF NEW.date IS NULL THEN
        SET NEW.date = CURRENT_TIMESTAMP;
    END IF;
END; 
// DELIMITER ;