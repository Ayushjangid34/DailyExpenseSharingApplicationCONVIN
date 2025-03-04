const { ERROR_CODES } = require('./errorCodes'); // Import the error codes

module.exports.handleError = (res, err) => {
  //console.error('Error:', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res
      .status(409)
      .json({ error: 'Duplicate entry', code: 'ER_DUP_ENTRY' });
  }

  // If error is an object with a custom code, map it to the corresponding ERROR_CODES
  if (err.code && ERROR_CODES[err.code]) {
    const { status, message } = ERROR_CODES[err.code];
    return res.status(status).json({ error: message, code: err.code });
  }

  // If no specific error code is matched, use the default internal server error
  const { status, message } = ERROR_CODES.INTERNAL_SERVER_ERROR;
  return res
    .status(status)
    .json({ error: message, code: 'INTERNAL_SERVER_ERROR' });
};
