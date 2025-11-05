import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { bookingsAPI, roomsAPI } from '../services/api';
import { bookingToEvent, formatDateTime, getTimeRange } from '../utils/helpers';
import BookingModal from '../components/BookingModal';
import toast from 'react-hot-toast';
import { Plus, X, MapPin, Clock, User as UserIcon, Trash2 } from 'lucide-react';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Get bookings for the current month
      const calendarApi = calendarRef.current?.getApi();
      const view = calendarApi?.view;

      const params = {};
      if (view) {
        params.dateFrom = view.activeStart.toISOString();
        params.dateTo = view.activeEnd.toISOString();
      }

      const response = await bookingsAPI.getAll(params);
      const bookings = response.data.data.bookings;

      const formattedEvents = bookings.map(bookingToEvent);
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (arg) => {
    setSelectedDate(new Date(arg.date));
    setIsBookingModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      ...event.extendedProps,
    });
  };

  const handleDeleteBooking = async () => {
    if (!selectedEvent) return;

    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingsAPI.delete(selectedEvent.id);
      toast.success('Booking cancelled successfully');
      setSelectedEvent(null);
      fetchBookings();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel booking';
      toast.error(message);
    }
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Room Calendar</h1>
            <p className="text-gray-600 mt-1">Click on a date to book a room</p>
          </div>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Booking</span>
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              editable={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              height="auto"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
              }}
            />
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedDate(null);
        }}
        onSuccess={fetchBookings}
        selectedDate={selectedDate}
      />

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={closeEventDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Purpose</label>
                <p className="text-gray-900 font-medium">{selectedEvent.purpose}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Time
                </label>
                <p className="text-gray-900">
                  {getTimeRange(selectedEvent.start, selectedEvent.end)}
                </p>
              </div>

              {selectedEvent.room && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Room
                  </label>
                  <p className="text-gray-900 font-medium">{selectedEvent.room.name}</p>
                  <p className="text-sm text-gray-600">{selectedEvent.room.location}</p>
                  <p className="text-sm text-gray-600">Capacity: {selectedEvent.room.capacity}</p>
                </div>
              )}

              {selectedEvent.user && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    Booked by
                  </label>
                  <p className="text-gray-900">{selectedEvent.user.name}</p>
                  <p className="text-sm text-gray-600">{selectedEvent.user.email}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    selectedEvent.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : selectedEvent.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedEvent.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            {selectedEvent.status !== 'cancelled' && (
              <div className="p-6 border-t">
                <button
                  onClick={handleDeleteBooking}
                  className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Cancel Booking</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
