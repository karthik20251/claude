const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/room.controller');
const { protect } = require('../middlewares/auth');
const { admin } = require('../middlewares/admin');
const { handleValidationErrors } = require('../middlewares/error');
const {
  createRoomValidation,
  updateRoomValidation,
  mongoIdValidation
} = require('../utils/validation');

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms (with optional filters)
 * @access  Public
 */
router.get('/', getRooms);

/**
 * @route   POST /api/rooms
 * @desc    Create a new room
 * @access  Private/Admin
 */
router.post('/', protect, admin, createRoomValidation, handleValidationErrors, createRoom);

/**
 * @route   GET /api/rooms/:id
 * @desc    Get single room by ID
 * @access  Public
 */
router.get('/:id', mongoIdValidation, handleValidationErrors, getRoom);

/**
 * @route   PATCH /api/rooms/:id
 * @desc    Update room
 * @access  Private/Admin
 */
router.patch('/:id', protect, admin, updateRoomValidation, handleValidationErrors, updateRoom);

/**
 * @route   DELETE /api/rooms/:id
 * @desc    Delete room (soft delete)
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, mongoIdValidation, handleValidationErrors, deleteRoom);

module.exports = router;
