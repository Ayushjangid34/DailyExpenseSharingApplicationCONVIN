const request = require('supertest');
const app = require('../index'); // Ensure this points to your app entry file

let expect;
before(async function () {
  const chai = await import('chai');
  expect = chai.expect;
});

describe('API Integration Tests', function () {
  let userId1, userId2, userId3; // To store user IDs for reuse in other tests

  // Test suite for /user/create endpoint
  describe('POST /user/create', () => {
    it('should create user with valid Indian mobile number', async () => {
      const res = await request(app).post('/user/create').send({
        email: 'ayushjangid34@gmail.com',
        first_name: 'John',
        last_name: 'Doe',
        mobile_number: '7568983187',
      });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('id');
      userId1 = res.body.id; // Store the first user ID
    });

    it('should return MISSING_FIELDS error for missing email', async () => {
      const res = await request(app).post('/user/create').send({
        first_name: 'John',
        last_name: 'Doe',
        mobile_number: '7568983187',
      });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISSING_EMAIL');
    });

    it('should return MISSING_FIELDS error for missing first_name', async () => {
      const res = await request(app).post('/user/create').send({
        email: 'testuser@example.com',
        last_name: 'Doe',
        mobile_number: '7568983187',
      });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISSING_FIRST_NAME');
    });

    it('should return MISSING_FIELDS error for missing last_name', async () => {
      const res = await request(app).post('/user/create').send({
        email: 'testuser@example.com',
        first_name: 'John',
        mobile_number: '7568983187',
      });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISSING_LAST_NAME');
    });

    it('should return MISSING_FIELDS error for missing mobile_number', async () => {
      const res = await request(app).post('/user/create').send({
        email: 'testuser@example.com',
        first_name: 'John',
        last_name: 'Doe',
      });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISSING_MOBILE');
    });

    it('should return INVALID_EMAIL for invalid email format', async () => {
      const res = await request(app).post('/user/create').send({
        email: 'invalidemail',
        first_name: 'John',
        last_name: 'Doe',
        mobile_number: '9123356789',
      });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('INVALID_EMAIL');
    });

    it('should return EMAIL_ALREADY_EXISTS for duplicate email', async () => {
      const res = await request(app).post('/user/create').send({
        email: 'ayushjangid34@gmail.com',
        first_name: 'John',
        last_name: 'Doe',
        mobile_number: '9123456780',
      });

      expect(res.statusCode).to.equal(409);
      expect(res.body.code).to.equal('EMAIL_ALREADY_EXISTS');
    });

    it('should return MOBILE_ALREADY_EXISTS for duplicate mobile number', async () => {
      const res = await request(app).post('/user/create').send({
        email: 'uniquetestuser@example.com',
        first_name: 'John',
        last_name: 'Doe',
        mobile_number: '7568983187',
      });

      expect(res.statusCode).to.equal(409);
      expect(res.body.code).to.equal('MOBILE_ALREADY_EXISTS');
    });

    it('should return INVALID_MOBILE_NUMBER for non-Indian number', async () => {
      const invalidNumbers = [
        '1234567890', // Doesn't start with 6-9
        '987654321', // Too short
        '98765432109', // Too long
        '5987654321', // Invalid starting digit
      ];

      for (const num of invalidNumbers) {
        const res = await request(app)
          .post('/user/create')
          .send({
            email: `test${num}@example.com`,
            first_name: 'John',
            last_name: 'Doe',
            mobile_number: num,
          });
        expect(res.statusCode).to.equal(400);
        expect(res.body.code).to.equal('INVALID_MOBILE_NUMBER');
      }
    });
  });

  // Test suite for /user/info endpoint
  describe('GET /user/info', () => {
    it('should retrieve user details by email', async () => {
      const res = await request(app)
        .get('/user/info')
        .query({ email: 'ayushjangid34@gmail.com' });

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('email', 'ayushjangid34@gmail.com');
    });

    it('should retrieve user details by ID', async () => {
      const res = await request(app).get('/user/info').query({ id: userId1 });

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('id', userId1);
    });

    it('should return MISSING_EMAIL_AND_ID error', async () => {
      const res = await request(app).get('/user/info');

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISSING_EMAIL_AND_ID');
    });

    it('should return INVALID_ID_FORMAT for invalid ID', async () => {
      const res = await request(app).get('/user/info').query({ id: 'invalid' });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('INVALID_ID_FORMAT');
    });

    it('should return USER_NOT_FOUND for non-existent email', async () => {
      const res = await request(app)
        .get('/user/info')
        .query({ email: 'nonexistent@example.com' });

      expect(res.statusCode).to.equal(404);
      expect(res.body.code).to.equal('USER_NOT_FOUND');
    });
  });

  // Test suite for /expense/add endpoint
  describe('POST /expense/add', () => {
    before(async () => {
      // Create additional users for participant testing
      const user2 = await request(app).post('/user/create').send({
        email: 'testuser2@example.com',
        first_name: 'Jane',
        last_name: 'Doe',
        mobile_number: '9123456790',
      });
      userId2 = user2.body.id;

      const user3 = await request(app).post('/user/create').send({
        email: 'testuser3@example.com',
        first_name: 'Alice',
        last_name: 'Smith',
        mobile_number: '9123456791',
      });
      userId3 = user3.body.id;
    });

    // Success Cases
    it('should add an expense with equal split method', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 300,
          title: 'Groceries',
          description: 'Weekly groceries',
          expense_date_time: '2024-03-01T19:30:00',
          split_method: 'equal',
          participants: [
            { participant_id: userId1 },
            { participant_id: userId2 },
            { participant_id: userId3 },
          ],
        });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('ExpenseID');
    });

    it('should add an expense with exact split method', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 1000,
          title: 'Dinner',
          description: 'Dinner at a fancy restaurant',
          expense_date_time: '2024-03-05T19:00:00',
          split_method: 'exact',
          participants: [
            { participant_id: userId1, split_value: 400 },
            { participant_id: userId2, split_value: 600 },
          ],
        });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('ExpenseID');
    });

    it('should add an expense with percentage split method', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 5000,
          title: 'Project Budget',
          description: 'Project-related expenses',
          expense_date_time: '2024-03-10T15:45:00',
          split_method: 'percentage',
          participants: [
            { participant_id: userId1, split_value: 40 },
            { participant_id: userId2, split_value: 35 },
            { participant_id: userId3, split_value: 25 },
          ],
        });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('ExpenseID');
    });

    it('should handle very small expense amount (0.001)', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 0.001,
          title: 'Minimum Amount',
          description: 'Testing minimum amount',
          expense_date_time: '2024-03-01T12:00:00',
          split_method: 'equal',
          participants: [{ participant_id: userId1 }],
        });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('ExpenseID');
    });

    it('should handle very large expense amount (9999999999.999)', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 9999999999.999,
          title: 'Maximum Amount',
          description: 'Testing maximum amount',
          expense_date_time: '2024-03-01T12:00:00',
          split_method: 'equal',
          participants: [
            { participant_id: userId1 },
            { participant_id: userId2 },
            { participant_id: userId3 },
          ],
        });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('ExpenseID');
    });

    // Error Cases
    it('should return MISSING_FIELDS error for missing user_id', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          expenseAmount: 100,
          title: 'Test',
          split_method: 'equal',
          participants: [{ participant_id: userId1 }],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISSING_CREATOR_ID');
    });

    it('should return MISSING_FIELDS error for missing expenseAmount', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          title: 'Test',
          split_method: 'equal',
          participants: [{ participant_id: userId1 }],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISSING_EXPENSE_AMOUNT');
    });

    it('should return MISSING_FIELDS error for missing title', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          split_method: 'equal',
          participants: [{ participant_id: userId1 }],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISSING_TITLE');
    });

    it('should return MISSING_FIELDS error for missing split_method', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          title: 'Test',
          participants: [{ participant_id: userId1 }],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISSING_SPLIT_METHOD');
    });

    it('should return MISSING_FIELDS error for missing participants', async () => {
      const res = await request(app).post('/expense/add').send({
        user_id: userId1,
        expenseAmount: 100,
        title: 'Test',
        split_method: 'equal',
        expense_date_time: '2024-03-01T12:00:00',
      });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISSING_PARTICIPANTS_ARRAY');
    });

    it('should return MISSING_FIELDS error for missing expense_date_time', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          title: 'Test',
          split_method: 'equal',
          participants: [{ participant_id: userId1 }],
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISSING_EXPENSE_DATE_TIME');
    });

    it('should return UNWANTED_SPLIT_VALUE_FOR_EQUAL_METHOD', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          title: 'Test',
          split_method: 'equal',
          participants: [
            { participant_id: userId1, split_value: 50 },
            { participant_id: userId2, split_value: 50 },
          ],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('UNWANTED_SPLIT_VALUE_FOR_EQUAL_METHOD');
    });

    it('should return INVALID_PERCENTAGE_TOTAL', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          title: 'Test',
          split_method: 'percentage',
          participants: [
            { participant_id: userId1, split_value: 50 },
            { participant_id: userId2, split_value: 60 },
          ],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('INVALID_PERCENTAGE_TOTAL');
    });

    it('should return PARTICIPANT_NOT_FOUND', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          title: 'Test',
          split_method: 'equal',
          participants: [
            { participant_id: userId1 },
            { participant_id: 9999 }, // Non-existent user
          ],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('PARTICIPANT_NOT_FOUND');
    });

    it('should return FUTURE_DATE_TIME_NOT_ALLOWED', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          title: 'Test',
          split_method: 'equal',
          participants: [{ participant_id: userId1 }],
          expense_date_time: '2030-01-01T12:00:00',
        });

      expect(res.statusCode).to.equal(422);
      expect(res.body.code).to.equal('FUTURE_DATE_TIME_NOT_ALLOWED');
    });

    it('should return INVALID_DATE_TIME_FORMAT', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          title: 'Test',
          split_method: 'equal',
          participants: [{ participant_id: userId1 }],
          expense_date_time: '2024/03/01 12:00:00', // Invalid format
        });

      expect(res.statusCode).to.equal(422);
      expect(res.body.code).to.equal('INVALID_DATE_TIME_FORMAT');
    });

    it('should return INVALID_EXPENSE_AMOUNT for negative amount', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: -100,
          title: 'Test',
          split_method: 'equal',
          participants: [{ participant_id: userId1 }],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('INVALID_EXPENSE_AMOUNT');
    });

    it('should return INVALID_EXPENSE_AMOUNT for too large amount', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 10000000000, // Exceeds the maximum allowed amount
          title: 'Test',
          split_method: 'equal',
          participants: [{ participant_id: userId1 }],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('INVALID_EXPENSE_AMOUNT');
    });

    it('should return INVALID_EXACT_SPLIT_AMOUNT for mismatched totals', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          title: 'Test',
          split_method: 'exact',
          participants: [
            { participant_id: userId1, split_value: 40 },
            { participant_id: userId2, split_value: 50 }, // Total is 90, not 100
          ],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('MISMATCH_TOTAL_EXACT_AMOUNT');
    });

    it('should return INVALID_SPLIT_PERCENTAGE for invalid percentage values', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          title: 'Test',
          split_method: 'percentage',
          participants: [
            { participant_id: userId1, split_value: 110 }, // Exceeds 100%
            { participant_id: userId2, split_value: -10 }, // Negative value
          ],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('INVALID_SPLIT_PERCENTAGE');
    });

    it('should return CREATOR_MUST_PARTICIPATE', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          title: 'Test',
          split_method: 'equal',
          participants: [
            { participant_id: userId2 },
            { participant_id: userId3 },
          ],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('CREATOR_MUST_PARTICIPATE');
    });

    it('should return DUPLICATE_PARTICIPANTS', async () => {
      const res = await request(app)
        .post('/expense/add')
        .send({
          user_id: userId1,
          expenseAmount: 100,
          title: 'Test',
          split_method: 'equal',
          participants: [
            { participant_id: userId1 },
            { participant_id: userId1 }, // Duplicate participant
          ],
          expense_date_time: '2024-03-01T12:00:00',
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body.code).to.equal('DUPLICATE_PARTICIPANTS');
    });
  });

  // Test suite for /expense/:user_id endpoint
  describe('GET /expense/:user_id', () => {
    it('should retrieve expenses for a user', async () => {
      const res = await request(app).get(`/expense/user/${userId1}`);

      expect(res.statusCode).to.equal(200);
      expect(Array.isArray(res.body)).to.be.true;
    });

    it('should return USER_NOT_FOUND for non-existent user ID', async () => {
      const res = await request(app).get('/expense/user/9999');

      expect(res.statusCode).to.equal(404);
      expect(res.body.code).to.equal('USER_NOT_FOUND');
    });

    it('should filter expenses by valid date', async () => {
      const res = await request(app)
        .get(`/expense/user/${userId1}`)
        .query({ date: '2024-03-01' });

      expect(res.statusCode).to.equal(200);
      expect(Array.isArray(res.body)).to.be.true;
    });

    it('should return INVALID_DATE_FORMAT for invalid date', async () => {
      const res = await request(app)
        .get(`/expense/user/${userId1}`)
        .query({ date: 'invalid-date' });

      expect(res.statusCode).to.equal(422);
      expect(res.body.code).to.equal('INVALID_DATE_FORMAT');
    });
  });

  // Test suite for /expense/overall endpoint
  describe('GET /expense/overall', () => {
    it('should retrieve overall expenses', async () => {
      const res = await request(app).get('/expense/overall');

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('overall_summary');
      expect(res.body).to.have.property('expenses');
      expect(res.body).to.have.property('user_summary');
    });

    it('should return INVALID_DATE_FORMAT for invalid date', async () => {
      const res = await request(app)
        .get('/expense/overall')
        .query({ date: 'invalid-date' });

      expect(res.statusCode).to.equal(422);
      expect(res.body.code).to.equal('INVALID_DATE_FORMAT');
    });
  });
});
