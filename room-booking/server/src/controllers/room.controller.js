const Room = require('../models/Room');

/**
 * @route   POST /api/rooms
 * @desc    Create a new room (Admin only)
 * @access  Private/Admin
 */
const createRoom = async (req, res, next) => {
  try {
    const { name, capacity, amenities, location, description } = req.body;

    const room = await Room.create({
      name,
      capacity,
      amenities: amenities || [],
      location,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms with optional filters
 * @access  Public
 */
const getRooms = async (req, res, next) => {
  try {
    const { capacity, amenities, location, isActive } = req.query;

    // Build query
    const query = {};

    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    if (amenities) {
      // Support comma-separated amenities
      const amenitiesArray = amenities.split(',').map(a => a.trim());
      query.amenities = { $all: amenitiesArray };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const rooms = await Room.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: { rooms }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/rooms/:id
 * @desc    Get single room by ID
 * @access  Public
 */
const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { room }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/rooms/:id
 * @desc    Update room (Admin only)
 * @access  Private/Admin
 */
const updateRoom = async (req, res, next) => {
  try {
    const { name, capacity, amenities, location, description, isActive } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Update fields
    if (name !== undefined) room.name = name;
    if (capacity !== undefined) room.capacity = capacity;
    if (amenities !== undefined) room.amenities = amenities;
    if (location !== undefined) room.location = location;
    if (description !== undefined) room.description = description;
    if (isActive !== undefined) room.isActive = isActive;

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: { room }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/rooms/:id
 * @desc    Delete room (Admin only)
 * @access  Private/Admin
 */
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Soft delete by setting isActive to false
    room.isActive = false;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully (soft delete)',
      data: { room }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom
};
