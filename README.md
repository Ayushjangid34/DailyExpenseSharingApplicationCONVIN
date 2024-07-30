# CONCVIN.AI ASSIGNMENT

## Description
This repository contains the backend project that was an assignment from COVIN.AI. It is a Daily Expense Sharing Application, which allows us to split our daily expenses among users using different split methods based on percentages, equal shares, or exact amounts. The repository includes index.js, which serves as the entry point for the project (i.e., the server). Additionally, there is an SQL.sql file that we can use while setting up the MySQL database. Integration test cases are written in the integration.test.js file.

## Features

- **Expense Splitting:** Allows users to split expenses using various methods, including percentage-based splits, equal shares, and exact amounts.
  
- **Database Integration:** Backend includes robust validation for each entry and integrates seamlessly with a MySQL database to manage user data and expenses effectively.

- **Flexible API Endpoints:** Provides a range of API endpoints for creating users, retrieving user details, managing expenses, and getting overall expense summaries.

- **Comprehensive Testing:** Includes integration tests to ensure the reliability and accuracy of the application's functionality, covering user management and expense processing.

- **Flexible Amount Handling:** Capable of splitting amounts ranging from 0.001 to 9999999999.999 .

- **Balance Sheet Download:** Provides functionality to download a detailed balance sheet in Excel format.

## Endpoints ( API DOC )

### Create User

- **URL:** `/createUser`
- **Method:** `POST`
- **Description:** Create a new user in the system.
- **Request Body:**
    ```json
    {
        "email": "string",
        "first_name": "string",
        "middle_name": "string",
        "last_name": "string",
        "mobile_number": "string"
    }
    ```
- **Response:**
    - **Success (201):**
      ```json
      {
          "id": "integer"
      }
      ```
- **Example Request:**
    ```http
    POST /createUser
    Content-Type: application/json

    {
        "email": "john.doe@example.com",
        "first_name": "John",
        "middle_name": "M",
        "last_name": "Doe",
        "mobile_number": "9876543210"
    }
    ```
- **Example Response:**
    ```json
    {
        "id": 1
    }
    ```

### Retrieve User Details

- **URL:** `/user/info`
- **Method:** `GET`
- **Description:** Retrieve user details by email or ID. ID is prioritized over email.
- **Query Parameters:**
    - `email` (optional): User's email address.
    - `id` (optional): User's ID.
- **Response:**
    - **Success (200):**
      ```json
      {
          "id": "integer",
          "email": "string",
          "first_name": "string",
          "middle_name": "string",
          "last_name": "string",
          "mobile_number": "string"
      }
      ```
  - **Example Request:**
    ```http
    GET /user/info?email=john.doe@example.com
    ```
- **Example Response:**
    ```json
    {
        "id": 1,
        "email": "john.doe@example.com",
        "first_name": "John",
        "middle_name": "M",
        "last_name": "Doe",
        "mobile_number": "9876543210"
    }
    ```  

### Retrieve User Expenses

- **URL:** `/user/:user_id/expenses`
- **Method:** `GET`
- **Description:** Retrieve expenses for a specific user.
- **URL Parameters:**
    - `user_id`: User's ID.
- **Query Parameters:**
    - `date` (optional): Filter expenses by date in `YYYY-MM-DD` format.
- **Response:**
    - **Success (200):**
      ```json
      [
          {
              "expense_id": "integer",
              "title": "string",
              "description": "string",
              "expense_date": "string",
              "split_method": "string",
              "total_amount": "number",
              "amount_owed": "number"
          }
      ]
      ```
- **Example Request:**
    ```http
    GET /user/1/expenses?date=2024-07-30
    ```
- **Example Response:**
    ```json
    [
        {
            "expense_id": 101,
            "title": "Lunch",
            "description": "Lunch at café",
            "expense_date": "2024-07-30T12:00:00",
            "split_method": "equal",
            "total_amount": 50.00,
            "amount_owed": 25.00
        }
    ]
    ```

### Retrieve Overall Expenses

- **URL:** `/expenses/overall`
- **Method:** `GET`
- **Description:** Retrieve overall expenses and user summaries.
- **Query Parameters:**
    - `date` (optional): Filter expenses by date in `YYYY-MM-DD` format.
- **Response:**
    - **Success (200):**
      ```json
      {
          "overall_summary": {
              "total_expenses": "integer",
              "total_amount_spent": "number"
          },
          "expenses": [
              {
                  "expense_id": "integer",
                  "title": "string",
                  "description": "string",
                  "expense_date": "string",
                  "total_amount": "number",
                  "split_method": "string"
              }
          ],
          "user_summary": [
              {
                  "user_id": "integer",
                  "email": "string",
                  "total_amount_owed": "number"
              }
          ]
      }
      ```
 - **Example Request:**
    ```http
    GET /expenses/overall?date=2024-07-30
    ```
- **Example Response:**
    ```json
    {
        "overall_summary": {
            "total_expenses": 3,
            "total_amount_spent": 150.00
        },
        "expenses": [
            {
                "expense_id": 101,
                "title": "Lunch",
                "description": "Lunch at café",
                "expense_date": "2024-07-30T12:00:00",
                "total_amount": 50.00,
                "split_method": "equal"
            }
        ],
        "user_summary": [
            {
                "user_id": 1,
                "email": "john.doe@example.com",
                "total_amount_owed": 25.00
            }
        ]
    }
    ```  

### Add Expenses

- **URL:** `/expenses/add`
- **Method:** `POST`
- **Description:** Add a new expense and distribute it among participants.
- **Request Body:**
    ```json
    {
        "user_id": "integer",
        "expenseAmount": "number",
        "title": "string",
        "description": "string",
        "expense_date_time": "string",
        "split_method": "string",
        "participants": [
            {
                "participant_id": "integer",
                "split_value": "number"
            }
        ]
    }
    ```
- **Response:**
    - **Success (201):**
      ```json
      {
          "ExpenseID": "integer"
      }
      ```
- **Example Request:**
    ```http
    POST /expenses/add
    Content-Type: application/json

    {
        "user_id": 1,
        "expenseAmount": 100.00,
        "title": "Dinner",
        "description": "Dinner at restaurant",
        "expense_date_time": "2024-07-30T20:00:00",
        "split_method": "percentage",
        "participants": [
            {
                "participant_id": 1,
                "split_value": 50
            },
            {
                "participant_id": 2,
                "split_value": 50
            }
        ]
    }
    ```
- **Example Response:**
    ```json
    {
        "ExpenseID": 102
    }
    ```
   

### Generate and Download Balance Sheet

- **URL:** `/expenses/balance-sheet`
- **Method:** `GET`
- **Description:** Generate and download a balance sheet in Excel format.
- **Query Parameters:**
    - `date` (optional): Filter by date in `YYYY-MM-DD` format.
- **Response:**
    - **Success (200):** Returns an Excel file with individual and overall expenses.
 
- **Example Request:**
    ```http
    GET /expenses/balance-sheet?date=2024-07-30
    ```

## Error Codes

- **400 Bad Request:** The request could not be understood or was missing required parameters.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (v20.16.0)
- **npm** (10.8.1)
- **MySQL** (8.0.39)


## Setup Instrictions

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Ayushjangid34/DailyExpenseSharingApplicationCONVIN.git
    ```
2. **Create the Database:** Execute the provided SQL script (SQL.sql) to create the MySQL database named “DailyExpSharingApp”. You can do this using a MySQL client or command line.

3. **Configure Database Connection:**
    - Navigate to the cloned repository.
    - Open the `dbConnection.js` file.
    - Update the `host`, `user`, and `password` fields according to your MySQL database configuration.
4. **Install Dependencies:** Open your terminal and run the following command:
```bash
npm install
```
5. **Start the Server:** To run the server, execute:
```bash
npm start
```

6. **Run Integration Tests:** To perform integration testing, run:
```bash
npm test
```
## Additional Point to keep in Mind
- Always refer to the API documentation for logical requests.
+ The person creating the expense split must be a participant.


Feel free to ask queries ! 😊

## 🔗 Links
[![Gmail](https://img.shields.io/badge/Gmail-%23D14836?style=for-the-badge&logo=gmail&logoColor=white)](ayushjangid34@gmail.com)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ayushjangid34)
[![Phone](https://img.shields.io/badge/📞%20Phone-%23007BFF?style=for-the-badge&logo=phone&logoColor=white)](+917568983187)
