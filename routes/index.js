const express = require('express');
const router = express.Router();

router.use('/user', require('./user.routes'));
router.use('/expense', require('./expense.routes'));

module.exports = router;
