module.exports.ERROR_CODES = {
  // Generic Errors
  MISSING_FIELDS: { status: 400, message: 'Required fields are missing, please refer API doc' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },

  MISSING_USER_ID: { status: 400, message: 'User ID is required !' },

  MISSING_FIRST_NAME: { status: 400, message: 'First name is required but not provided' },
  MISSING_LAST_NAME: { status: 400, message: 'Last name is required but not provided' },
  MISSING_MOBILE: { status: 400, message: 'Mobile number is required but not provided' },
  MISSING_EMAIL: { status: 400, message: 'Email is required but not provided' },
  MISSING_CREATOR_ID: { status: 400, message: 'Creator ID ( user_id )is required to perform split creation but not provided' },
  MISSING_EXPENSE_AMOUNT: { status: 400, message: 'Expense amount is required but not provided' },
  MISSING_TITLE: { status: 400, message: 'Title is required but not provided' },
  MISSING_SPLIT_METHOD: { status: 400, message: 'Split method is required but not provided' },
  MISSING_PARTICIPANTS_ARRAY: { status: 400, message: 'Array of participation objects is required but not provided' },
  MISSING_EXPENSE_DATE_TIME: { status: 400, message: 'Expense date and time is required but not provided' },

  UNWANTED_SPLIT_VALUE_FOR_EQUAL_METHOD: { status: 400, message: 'Split value should not be provided when the split method is "equal"' },

  // Email and ID Errors
  MISSING_EMAIL_AND_ID: { status: 400, message: 'Email or ID is required to fetch user' },
  INVALID_ID_FORMAT: { status: 400, message: 'Invalid ID format' },
  EMAIL_ALREADY_EXISTS: { status: 409, message: 'Email already exists' },
  MOBILE_ALREADY_EXISTS: { status: 409, message: 'Mobile number already exists' },

  // Validation Errors
  INVALID_EMAIL: { status: 400, message: 'Incorrect Email' },
  INVALID_MOBILE_NUMBER: { status: 400, message: 'Incorrect Mobile Number' },

  INVALID_EXPENSE_AMOUNT: { status: 400, message: 'Expense amount is invalid. Please enter a valid amount in between 0.001 to 9999999999.999'  },
  INVALID_EXACT_SPLIT_AMOUNT: { status: 400, message: 'Exact split amount is invalid. Please enter a valid amount in between 0.001 to 9999999999.999' },
  INVALID_SPLIT_PERCENTAGE: { status: 400, message: 'Split value should be greater than 1 and below 100 while using percentage split method!' },
  INVALID_PERCENTAGE_TOTAL: { status: 400, message: 'Sum of all participants split_value must equal to 100 while using "percentage" split method !' },
  INVALID_EQUAL_SPLIT: { status: 400, message: 'The expense amount is too small to be splited equally among all participants!' },
  MISMATCH_TOTAL_EXACT_AMOUNT: { status: 400, message: 'Sum of all participants split_value must equal to expense amount while using "exact" split method !' },

  // Expense-related Errors
  MISSING_PARTICIPANTS: { status: 400, message: 'At least one participation is required' },
  INVALID_SPLIT_METHOD: { status: 400, message: 'Invalid split method specified' },
  CREATOR_MUST_PARTICIPATE: { status: 400, message: 'The creator of the expenses must participate' },
  DUPLICATE_PARTICIPANTS: { status: 400, message: 'Duplicate participant IDs are not allowed' },
  INVALID_SPLIT_AMOUNT: { status: 400, message: 'The amount is too small to be split!' },
  INVALID_EXACT_AMOUNT: { status: 400, message: 'Invalid exact amount specified!' },
  INVALID_SPLIT_VALUE: { status: 400, message: 'Invalid Split Value!' },
  PARTICIPANT_NOT_FOUND: { status: 400, message: 'One or more participants are not registered.' },
  INVALID_PARTICIPANT_ID: { status: 400, message: 'Incorrect participant ID!' },

  // User ID Errors
  MISSING_USER_ID: { status: 400, message: 'User ID is required' },

  // Date Validation Errors
  INVALID_DATE_FORMAT: { status: 422, message: 'Invalid date-time format. Expected format: YYYY-MM-DD' },
  INVALID_DATE_TIME_FORMAT: { status: 422, message: 'Invalid date-time format. Expected format: YYYY-MM-DDTHH:mm:ss.' },
  INVALID_DATE_VALUE: { status: 422, message: 'Invalid date value.' },
  INVALID_DATE_TIME_VALUE: { status: 422, message: 'Invalid date-time value.' },
  FUTURE_DATE_NOT_ALLOWED: { status: 422, message: 'Future dates are not allowed.' },
  FUTURE_DATE_TIME_NOT_ALLOWED: { status: 422, message: 'Future date time is not allowed.' },
  DATE_VALIDATION_ERROR: { status: 422, message: 'An unexpected error occurred during date validation.' },
  DATE_TIME_VALIDATION_ERROR: { status: 422, message: 'An unexpected error occurred during date-time validation.' },

  // Internal Errors
  INTERNAL_SERVER_ERROR: {  status: 500,  message: 'Internal Server Error' }
};
