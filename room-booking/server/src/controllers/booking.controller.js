const Booking = require('../models/Booking');
const Room = require('../models/Room');

/**
 * Helper function to parse date and time into ISO Date
 */
const parseDateTime = (dateStr, timeStr) => {
  // dateStr format: YYYY-MM-DD
  // timeStr format: HH:mm
  const [hours, minutes] = timeStr.split(':');
  const datetime = new Date(dateStr);
  datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return datetime;
};

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking with auto-room assignment
 * @access  Private
 */
const createBooking = async (req, res, next) => {
  try {
    const { preferredRoomId, date, startTime, endTime, purpose } = req.body;
    const userId = req.user._id;

    // Parse date and times
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0); // Normalize to midnight

    const startDateTime = parseDateTime(date, startTime);
    const endDateTime = parseDateTime(date, endTime);

    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Validate that booking is not in the past
    if (startDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book in the past'
      });
    }

    let assignedRoom = null;

    // Try preferred room first if provided
    if (preferredRoomId) {
      const preferredRoom = await Room.findById(preferredRoomId);

      if (!preferredRoom) {
        return res.status(404).json({
          success: false,
          message: 'Preferred room not found'
        });
      }

      if (!preferredRoom.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Preferred room is not active'
        });
      }

      // Check for conflicts
      const hasConflict = await Booking.hasConflict(
        preferredRoomId,
        startDateTime,
        endDateTime
      );

      if (!hasConflict) {
        assignedRoom = preferredRoom;
      }
    }

    // If no preferred room or preferred room is unavailable, auto-assign
    if (!assignedRoom) {
      const availableRooms = await Booking.findAvailableRooms(
        startDateTime,
        endDateTime,
        1 // minimum capacity
      );

      if (availableRooms.length === 0) {
        return res.status(409).json({
          success: false,
          message: 'No rooms available for the selected time slot',
          preferredRoomUnavailable: !!preferredRoomId
        });
      }

      // Assign the first available room
      assignedRoom = availableRooms[0];
    }

    // Create the booking
    const booking = await Booking.create({
      room: assignedRoom._id,
      user: userId,
      date: bookingDate,
      startTime: startDateTime,
      endTime: endDateTime,
      purpose,
      status: 'confirmed'
    });

    // Populate room and user details
    await booking.populate('room', 'name location capacity amenities');
    await booking.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking,
        wasPreferredRoom: preferredRoomId ? assignedRoom._id.toString() === preferredRoomId : true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bookings/my
 * @desc    Get current user's bookings
 * @access  Private
 */
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { upcoming, past } = req.query;

    const query = { user: userId, status: { $ne: 'cancelled' } };

    if (upcoming === 'true') {
      query.startTime = { $gte: new Date() };
    } else if (past === 'true') {
      query.endTime = { $lt: new Date() };
    }

    const bookings = await Booking.find(query)
      .populate('room', 'name location capacity amenities')
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (Admin) or filter by room/date
 * @access  Private (Admin for all, authenticated users for filtering)
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { roomId, dateFrom, dateTo, status } = req.query;

    const query = {};

    // Only admins can see all bookings without filters
    if (req.user.role !== 'admin' && !roomId && !dateFrom) {
      return res.status(403).json({
        success: false,
        message: 'Use /api/bookings/my to get your bookings'
      });
    }

    if (roomId) {
      query.room = roomId;
    }

    if (dateFrom || dateTo) {
      query.startTime = {};
      if (dateFrom) {
        query.startTime.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.startTime.$lte = endDate;
      }
    }

    if (status) {
      query.status = status;
    } else {
      // By default, don't show cancelled bookings
      query.status = { $ne: 'cancelled' };
    }

    const bookings = await Booking.find(query)
      .populate('room', 'name location capacity amenities')
      .populate('user', 'name email')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking
 * @access  Private (own booking or admin)
 */
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room', 'name location capacity amenities')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization: user must own the booking or be an admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/bookings/:id
 * @desc    Update/reschedule booking
 * @access  Private (own booking or admin)
 */
const updateBooking = async (req, res, next) => {
  try {
    const { date, startTime, endTime, purpose } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Cannot update cancelled bookings
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update cancelled booking'
      });
    }

    // Update fields
    let startDateTime = booking.startTime;
    let endDateTime = booking.endTime;
    let bookingDate = booking.date;

    if (date) {
      bookingDate = new Date(date);
      bookingDate.setHours(0, 0, 0, 0);
    }

    if (startTime) {
      startDateTime = parseDateTime(
        date || booking.date.toISOString().split('T')[0],
        startTime
      );
    }

    if (endTime) {
      endDateTime = parseDateTime(
        date || booking.date.toISOString().split('T')[0],
        endTime
      );
    }

    // Validate times
    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    if (startDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule to the past'
      });
    }

    // Check for conflicts (excluding current booking)
    const hasConflict = await Booking.hasConflict(
      booking.room,
      startDateTime,
      endDateTime,
      booking._id
    );

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'Selected time slot conflicts with another booking'
      });
    }

    // Update booking
    booking.date = bookingDate;
    booking.startTime = startDateTime;
    booking.endTime = endDateTime;
    if (purpose) booking.purpose = purpose;

    await booking.save();
    await booking.populate('room', 'name location capacity amenities');
    await booking.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel booking
 * @access  Private (own booking or admin)
 */
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Soft delete: mark as cancelled
    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking
};
