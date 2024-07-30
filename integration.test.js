const request = require('supertest');
const app = require('./index'); // Ensure this points to your server file

describe('API Integration Tests', function () {
  let chai;
  let expect;

  before(async function () {
    ({ expect } = await import('chai'));
  });

  // Helper function to clean up test data
  const cleanUp = (done) => {
    // Add cleanup logic if necessary
    done();
  };

  beforeEach((done) => {
    cleanUp(done);
  });

  describe('POST /createUser', function () {
    it('should create a new user successfully', function (done) {
      request(app)
        .post('/createUser')
        .send({
          email: 'teqstuser@example.com',
          first_name: 'John',
          middle_name: 'A',
          last_name: 'Doe',
          mobile_number: '9123956789'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property('id');
        })
        .end(done);
    });

    it('should return an error for missing fields', function (done) {
      request(app)
        .post('/createUser')
        .send({
          email: 'testuser@example.com',
          first_name: 'John'
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Required fields are missing');
        })
        .end(done);
    });

    it('should return an error for invalid mobile number', function (done) {
      request(app)
        .post('/createUser')
        .send({
          email: 'testuser@example.com',
          first_name: 'John',
          middle_name: 'A',
          last_name: 'Doe',
          mobile_number: '0123456789'
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Incorrect Mobile Number');
        })
        .end(done);
    });

    it('should return an error for invalid email', function (done) {
      request(app)
        .post('/createUser')
        .send({
          email: 'invalidemail',
          first_name: 'John',
          middle_name: 'A',
          last_name: 'Doe',
          mobile_number: '9123456789'
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Incorrect Email');
        })
        .end(done);
    });
  });

  describe('GET /user/info', function () {
    it('should retrieve user details by email', function (done) {
      request(app)
        .get('/user/info')
        .query({ email: 'teqstuser@example.com' })
        .expect(200)
        .expect((res) => {
          expect(res.body).to.have.property('email', 'teqstuser@example.com');
        })
        .end(done);
    });

    it('should retrieve user details by ID', function (done) {
      request(app)
        .get('/user/info')
        .query({ id: 1 })
        .expect(200)
        .expect((res) => {
          expect(res.body).to.have.property('id', 1);
        })
        .end(done);
    });

    it('should return an error for missing email and ID', function (done) {
      request(app)
        .get('/user/info')
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Either email or id is required');
        })
        .end(done);
    });

    it('should return an error for invalid ID format', function (done) {
      request(app)
        .get('/user/info')
        .query({ id: 'invalid' })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Invalid ID format');
        })
        .end(done);
    });

    it('should return an error for incorrect email format', function (done) {
      request(app)
        .get('/user/info')
        .query({ email: 'invalidemail' })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Incorrect Email');
        })
        .end(done);
    });
  });

  describe('GET /user/:user_id/expenses', function () {
    it('should retrieve expenses for a user', function (done) {
      request(app)
        .get('/user/1/expenses')
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.an('array');
        })
        .end(done);
    });

    it('should return an error for invalid date format', function (done) {
      request(app)
        .get('/user/1/expenses')
        .query({ date: 'invalid-date' })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Invalid date format. Expected format: YYYY-MM-DD');
        })
        .end(done);
    });

    it('should return an error for future date', function (done) {
      request(app)
        .get('/user/1/expenses')
        .query({ date: "2026-07-30" })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Future Date is not allowed!');
        })
        .end(done);
    });
  });

  describe('GET /expenses/overall', function () {
    it('should retrieve overall expenses', function (done) {
      request(app)
        .get('/expenses/overall')
        .expect(200)
        .expect((res) => {
          expect(res.body).to.have.property('overall_summary');
          expect(res.body).to.have.property('expenses');
          expect(res.body).to.have.property('user_summary');
        })
        .end(done);
    });

    it('should return an error for invalid date format', function (done) {
      request(app)
        .get('/expenses/overall')
        .query({ date: 'invalid-date' })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Invalid date format. Expected format: YYYY-MM-DD');
        })
        .end(done);
    });

    it('should return an error for future date', function (done) {
      request(app)
        .get('/expenses/overall')
        .query({ date: "2026-01-01"})
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Future Date is not allowed!');
        })
        .end(done);
    });
  });

  describe('POST /expenses/add', function () {
    it('should add an expense successfully', function (done) {
      request(app)
        .post('/expenses/add')
        .send({
          user_id: 1,
          expenseAmount: 100,
          title: 'Dinner',
          description: 'Dinner at restaurant',
          expense_date_time: new Date().toISOString().split('.')[0],
          split_method: 'equal',
          participants: [
            { participant_id: 1, split_value: 0 },
            { participant_id: 2, split_value: 0 }
          ]
        })
        .expect(500)
        .expect((res) => {
          expect(res.body).to.have.property('error');
        })
        .end(done);
    });

    it('should return an error for missing fields', function (done) {
      request(app)
        .post('/expenses/add')
        .send({
          user_id: 1,
          title: 'Dinner',
          split_method: 'equal'
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Required fields are missing');
        })
        .end(done);
    });

    it('should return an error for invalid date-time format', function (done) {
      request(app)
        .post('/expenses/add')
        .send({
          user_id: 1,
          expenseAmount: 100,
          title: 'Dinner',
          description: 'Dinner at restaurant',
          expense_date_time: 'invalid-date-time',
          split_method: 'equal',
          participants: [
            { participant_id: 1, split_value: 0 },
            { participant_id: 2, split_value: 0 }
          ]
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Invalid date-time format. Expected format: YYYY-MM-DDTHH:mm:ss');
        })
        .end(done);
    });

    it('should return an error for invalid split method', function (done) {
      request(app)
        .post('/expenses/add')
        .send({
          user_id: 1,
          expenseAmount: 100,
          title: 'Dinner',
          description: 'Dinner at restaurant',
          expense_date_time: new Date().toISOString().split('.')[0],
          split_method: 'invalid',
          participants: [
            { participant_id: 1, split_value: 0 },
            { participant_id: 2, split_value: 0 }
          ]
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).to.equal('Invalid split method');
        })
        .end(done);
    });
  });
});
