const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Please provide a room']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a booking date'],
    // Store as midnight UTC for the booking date
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide an end time']
  },
  purpose: {
    type: String,
    required: [true, 'Please provide a purpose for the booking'],
    trim: true,
    maxlength: [500, 'Purpose cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
BookingSchema.index({ room: 1, date: 1, startTime: 1, endTime: 1 });
BookingSchema.index({ user: 1, date: 1 });
BookingSchema.index({ status: 1 });

// Validation: end time must be after start time
BookingSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

/**
 * Static method to check for booking conflicts
 * Returns true if there's a conflict, false otherwise
 */
BookingSchema.statics.hasConflict = async function(roomId, startTime, endTime, excludeBookingId = null) {
  const query = {
    room: roomId,
    status: { $ne: 'cancelled' },
    $or: [
      // New booking starts during existing booking
      {
        startTime: { $lte: startTime },
        endTime: { $gt: startTime }
      },
      // New booking ends during existing booking
      {
        startTime: { $lt: endTime },
        endTime: { $gte: endTime }
      },
      // New booking completely contains existing booking
      {
        startTime: { $gte: startTime },
        endTime: { $lte: endTime }
      }
    ]
  };

  // Exclude current booking when updating
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await this.findOne(query);
  return !!conflictingBooking;
};

/**
 * Static method to find available rooms for a time slot
 */
BookingSchema.statics.findAvailableRooms = async function(startTime, endTime, minCapacity = 1) {
  const Room = mongoose.model('Room');

  // Get all active rooms
  const allRooms = await Room.find({ isActive: true, capacity: { $gte: minCapacity } });

  // Check each room for conflicts
  const availableRooms = [];
  for (const room of allRooms) {
    const hasConflict = await this.hasConflict(room._id, startTime, endTime);
    if (!hasConflict) {
      availableRooms.push(room);
    }
  }

  return availableRooms;
};

/**
 * Static method to get bookings for a specific date range
 */
BookingSchema.statics.getBookingsByDateRange = async function(startDate, endDate, filters = {}) {
  const query = {
    startTime: { $gte: startDate },
    endTime: { $lte: endDate },
    status: { $ne: 'cancelled' },
    ...filters
  };

  return this.find(query)
    .populate('room', 'name location capacity')
    .populate('user', 'name email')
    .sort({ startTime: 1 });
};

module.exports = mongoose.model('Booking', BookingSchema);
