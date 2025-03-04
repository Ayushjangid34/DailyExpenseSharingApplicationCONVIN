const user = require('../models/user.model');
const { validateMobileNumber, validateEmail } = require('../utils/validator');
const { handleError } = require('../utils/errorHandler');

exports.createUser = async (req, res) => {
  try {
    const { email, first_name, middle_name, last_name, mobile_number } =
      req.body;
    // Validate required fields
    const requiredFields = [!email, !first_name, !last_name, !mobile_number];
    if (requiredFields.filter(Boolean).length >= 2)
      return handleError(res, { code: 'MISSING_FIELDS' });
    if (!first_name) return handleError(res, { code: 'MISSING_FIRST_NAME' });
    if (!last_name) return handleError(res, { code: 'MISSING_LAST_NAME' });
    if (!mobile_number) return handleError(res, { code: 'MISSING_MOBILE' });
    if (!email) return handleError(res, { code: 'MISSING_EMAIL' });

    // Mobile Number validation
    if (!validateMobileNumber(mobile_number))
      return handleError(res, { code: 'INVALID_MOBILE_NUMBER' });
    if (await user.isMobileRegistered(mobile_number))
      return handleError(res, { code: 'MOBILE_ALREADY_EXISTS' });

    // Email validation
    if (!validateEmail(email))
      return handleError(res, { code: 'INVALID_EMAIL' });
    if (await user.isEmailRegistered(email))
      return handleError(res, { code: 'EMAIL_ALREADY_EXISTS' });

    const userData = {
      email,
      first_name,
      middle_name,
      last_name,
      mobile_number,
    };
    const result = await user.create(userData); // Await the result of creating the user

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const { email, id } = req.query;

    if (!email && !id) {
      return handleError(res, { code: 'MISSING_EMAIL_AND_ID' });
    }

    const getUser = id ? id : email;
    let result;

    if (id) {
      if (isNaN(id)) {
        return handleError(res, { code: 'INVALID_ID_FORMAT' });
      }
      result = await user.getById(getUser); // Fetch user by ID
    } else {
      if (!validateEmail(email))
        return handleError(res, { code: 'INVALID_EMAIL' });
      result = await user.getByEmail(getUser); // Fetch user by email
    }

    if (!result) {
      return handleError(res, { code: 'USER_NOT_FOUND' });
    }

    return res.status(200).json(result);
  } catch (err) {
    handleError(res, err);
  }
};
