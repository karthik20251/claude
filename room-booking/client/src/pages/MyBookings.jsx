import { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';
import { formatDateTime, getTimeRange, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Clock, Trash2, AlertCircle } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    fetchMyBookings();
  }, [filter]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filter === 'upcoming') {
        params.upcoming = 'true';
      } else if (filter === 'past') {
        params.past = 'true';
      }

      const response = await bookingsAPI.getMy(params);
      setBookings(response.data.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingsAPI.delete(bookingId);
      toast.success('Booking cancelled successfully');
      fetchMyBookings();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel booking';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">View and manage your room bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 font-medium transition-colors ${
                filter === 'all'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-3 font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-3 font-medium transition-colors ${
                filter === 'past'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <AlertCircle className="w-16 h-16 mb-4" />
              <p className="text-lg">No bookings found</p>
            </div>
          ) : (
            <div className="divide-y">
              {bookings.map((booking) => (
                <div key={booking._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.purpose}
                          </h3>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">{booking.room.name}</p>
                            <p className="text-xs">{booking.room.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(booking.startTime).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs">
                              {getTimeRange(booking.startTime, booking.endTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="ml-4 flex items-center space-x-1 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
