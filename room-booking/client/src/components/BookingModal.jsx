import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, FileText } from 'lucide-react';
import { bookingsAPI, roomsAPI } from '../services/api';
import { formatDate, formatTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const BookingModal = ({ isOpen, onClose, onSuccess, selectedDate = null }) => {
  const [formData, setFormData] = useState({
    date: selectedDate || formatDate(new Date()),
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    preferredRoomId: '',
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      if (selectedDate) {
        setFormData(prev => ({ ...prev, date: formatDate(selectedDate) }));
      }
    }
  }, [isOpen, selectedDate]);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const response = await roomsAPI.getAll({ isActive: true });
      setRooms(response.data.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.endTime <= formData.startTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
      };

      if (formData.preferredRoomId) {
        payload.preferredRoomId = formData.preferredRoomId;
      }

      const response = await bookingsAPI.create(payload);

      const wasPreferredRoom = response.data.data.wasPreferredRoom;

      if (wasPreferredRoom) {
        toast.success('Booking created successfully!');
      } else {
        toast.success('Booking created! (Auto-assigned to available room)');
      }

      onSuccess();
      handleClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create booking';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      date: formatDate(new Date()),
      startTime: '09:00',
      endTime: '10:00',
      purpose: '',
      preferredRoomId: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Book a Room</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={formatDate(new Date())}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Preferred Room */}
          <div>
            <label htmlFor="preferredRoomId" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Preferred Room (Optional)
            </label>
            {loadingRooms ? (
              <div className="text-sm text-gray-500">Loading rooms...</div>
            ) : (
              <select
                id="preferredRoomId"
                name="preferredRoomId"
                value={formData.preferredRoomId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Auto-assign available room</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.name} (Capacity: {room.capacity}) - {room.location}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 mt-1">
              If your preferred room is unavailable, we'll auto-assign another room
            </p>
          </div>

          {/* Purpose */}
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Purpose
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="e.g., Team Sprint Planning, Client Meeting..."
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Booking...' : 'Book Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
