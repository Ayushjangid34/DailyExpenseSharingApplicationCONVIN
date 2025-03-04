const user = require('../models/user.model');
const amountRegex = /^\d{1,10}(\.\d{1,3})?$/; // Regular expression to validate the amount
const { handleError } = require('./errorHandler');

const validateMobileNumber = number => {
  const mobileRegex = /^[7-9][0-9]{9}$/; //Numbers starting with 0 is assigned for STD calls. Numbers starting from 2-6 is for landlines. So the left over i.e 7-9 is for mobile that we are considering in our application
  return mobileRegex.test(number);
};

const validateEmail = email => {
  const emailRegex =
    /^([a-zA-Z\d\.-]+)@([a-zA-Z\d-]+)\.([a-zA-Z]{2,8})(\.[a-zA-Z]{2,8})?$/;
  return emailRegex.test(email);
};

const validateDate = date => {
  return new Promise((resolve, reject) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Format: YYYY-MM-DD, Regular expression for valid date format

    // Check if the date matches the required format
    if (!dateRegex.test(date)) return reject({ code: 'INVALID_DATE_FORMAT' });
    try {
      const dateValue = new Date(date);
      const dateTest = new Date(date + 'T00:00:00.000Z')
        .toISOString()
        .split('T')[0];
      if (dateTest !== date) return reject({ code: 'INVALID_DATE_VALUE' });
      // Check if the date is in the future

      if (
        new Date(new Date().toLocaleDateString()) <
        new Date(new Date(dateValue))
      )
        return reject({ code: 'FUTURE_DATE_NOT_ALLOWED' });
      return resolve({ valid: true });
    } catch (error) {
      console.error('Date validation error:', error);
      return reject({ code: 'DATE_VALIDATION_ERROR' });
    }
  });
};

const validateDateTime = dateTime => {
  return new Promise((resolve, reject) => {
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/; // Format: YYYY-MM-DDTHH:mm:ss, Regular expression for valid date-time format without 'Z'

    // Check if the date matches the required format
    if (!dateTimeRegex.test(dateTime))
      return reject({ code: 'INVALID_DATE_TIME_FORMAT' });
    try {
      // Create a date object from the provided date-time
      const expenseDateTime = new Date(dateTime); // Converting local time to UTC
      const dateTest = new Date(dateTime + 'Z').toISOString().split('.')[0]; // converting to user provided local time to check validity of user provided time
      if (dateTest !== dateTime)
        return reject({ code: 'INVALID_DATE_TIME_VALUE' }); // Check if the date-time value is valid

      // Check if the date is in the future
      if (new Date().toISOString() < expenseDateTime.toISOString())
        return reject({ code: 'FUTURE_DATE_TIME_NOT_ALLOWED' });

      return resolve({ valid: true });
    } catch (error) {
      console.error('Error while validating date-time:', error);
      return reject({ code: 'DATE_TIME_VALIDATION_ERROR' });
    }
  });
};

const validateParticipations = (participants, userIds, split_method) => {
  return new Promise((resolve, reject) => {
    for (let participant of participants) {
      if (isNaN(participant.participant_id))
        return reject({ code: 'INVALID_PARTICIPANT_ID' });

      if (participant.split_value && split_method === 'equal')
        return reject({ code: 'UNWANTED_SPLIT_VALUE_FOR_EQUAL_METHOD' });

      if (
        split_method === 'exact' &&
        !amountRegex.test(participant.split_value)
      ) {
        return reject({ code: 'INVALID_EXACT_SPLIT_AMOUNT' });
      }

      if (
        split_method === 'percentage' &&
        (participant.split_value <= 0 || participant.split_value > 100)
      ) {
        return reject({ code: 'INVALID_SPLIT_PERCENTAGE' });
      }
    }
    // Fetch user IDs to check if participants are registered
    user
      .getAllByIds(userIds)
      .then(rows => {
        if (rows.length !== participants.length) {
          return reject({ code: 'PARTICIPANT_NOT_FOUND' });
        }
        resolve({ valid: true });
      })
      .catch(err => {
        console.error('Error checking participants registration:', err);
        reject({ code: 'INTERNAL_SERVER_ERROR' });
      });
  });
};

module.exports = {
  amountRegex,
  validateMobileNumber,
  validateEmail,
  validateDate,
  validateDateTime,
  validateParticipations,
};
