const { body, param, query } = require('express-validator');

/**
 * Validation rules for user signup
 */
const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
];

/**
 * Validation rules for creating a room
 */
const createRoomValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Room name is required')
    .isLength({ max: 100 }).withMessage('Room name cannot exceed 100 characters'),

  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1, max: 1000 }).withMessage('Capacity must be between 1 and 1000'),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters'),

  body('amenities')
    .optional()
    .isArray().withMessage('Amenities must be an array'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

/**
 * Validation rules for updating a room
 */
const updateRoomValidation = [
  param('id')
    .isMongoId().withMessage('Invalid room ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Room name cannot exceed 100 characters'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Capacity must be between 1 and 1000'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters'),

  body('amenities')
    .optional()
    .isArray().withMessage('Amenities must be an array'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean')
];

/**
 * Validation rules for creating a booking
 */
const createBookingValidation = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)'),

  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),

  body('endTime')
    .notEmpty().withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),

  body('purpose')
    .trim()
    .notEmpty().withMessage('Purpose is required')
    .isLength({ max: 500 }).withMessage('Purpose cannot exceed 500 characters'),

  body('preferredRoomId')
    .optional()
    .isMongoId().withMessage('Invalid room ID')
];

/**
 * Validation rules for updating a booking
 */
const updateBookingValidation = [
  param('id')
    .isMongoId().withMessage('Invalid booking ID'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)'),

  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),

  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),

  body('purpose')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Purpose cannot exceed 500 characters')
];

/**
 * Validation for MongoDB ID params
 */
const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

module.exports = {
  signupValidation,
  loginValidation,
  createRoomValidation,
  updateRoomValidation,
  createBookingValidation,
  updateBookingValidation,
  mongoIdValidation
};
