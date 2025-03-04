const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Defining a route to create a new user
router.post('/create', userController.createUser);

// Defining a GET route to retrieve user details using user email
// This will work using both email and id for user details retrieval, but id is prioritized over email. If both email and id are provided in the request parameters and if the id is incorrect, the API will not respond, even if the email is correct.
router.get('/info', userController.getUserInfo);

module.exports = router;
