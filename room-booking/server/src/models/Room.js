const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a room name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Room name cannot be more than 100 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide room capacity'],
    min: [1, 'Capacity must be at least 1'],
    max: [1000, 'Capacity cannot exceed 1000']
  },
  amenities: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    required: [true, 'Please provide room location'],
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
RoomSchema.index({ name: 1 });
RoomSchema.index({ capacity: 1 });
RoomSchema.index({ isActive: 1 });

// Virtual for booking count (can be populated if needed)
RoomSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'room'
});

module.exports = mongoose.model('Room', RoomSchema);
