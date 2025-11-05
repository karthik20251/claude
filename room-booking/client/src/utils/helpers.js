/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format time to HH:mm
 */
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format datetime for display
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get time range display
 */
export const getTimeRange = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const startStr = start.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const endStr = end.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${startStr} - ${endStr}`;
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Convert booking to calendar event format
 */
export const bookingToEvent = (booking) => {
  return {
    id: booking._id,
    title: booking.purpose,
    start: booking.startTime,
    end: booking.endTime,
    backgroundColor: booking.status === 'cancelled' ? '#ef4444' : '#3b82f6',
    borderColor: booking.status === 'cancelled' ? '#dc2626' : '#2563eb',
    extendedProps: {
      room: booking.room,
      user: booking.user,
      status: booking.status,
      purpose: booking.purpose,
    },
  };
};
