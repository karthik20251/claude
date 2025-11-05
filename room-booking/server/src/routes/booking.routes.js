const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking
} = require('../controllers/booking.controller');
const { protect } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/error');
const {
  createBookingValidation,
  updateBookingValidation,
  mongoIdValidation
} = require('../utils/validation');

/**
 * @route   GET /api/bookings/my
 * @desc    Get current user's bookings
 * @access  Private
 */
router.get('/my', protect, getMyBookings);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', protect, createBookingValidation, handleValidationErrors, createBooking);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (with filters)
 * @access  Private
 */
router.get('/', protect, getAllBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking
 * @access  Private
 */
router.get('/:id', protect, mongoIdValidation, handleValidationErrors, getBooking);

/**
 * @route   PATCH /api/bookings/:id
 * @desc    Update booking
 * @access  Private (own booking or admin)
 */
router.patch('/:id', protect, updateBookingValidation, handleValidationErrors, updateBooking);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel booking
 * @access  Private (own booking or admin)
 */
router.delete('/:id', protect, mongoIdValidation, handleValidationErrors, deleteBooking);

module.exports = router;
