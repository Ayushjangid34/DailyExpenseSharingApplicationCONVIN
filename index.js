const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());
// Parse incoming requests with URL-encoded payloads
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('./routes'));

// Default route for undefined routes
app.use((req, res, next) => {
  res.status(404).send('Route not found');
});

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

module.exports = app; // for testing purpose
