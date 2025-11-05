import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, LogOut, User, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Room Booking</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Calendar
                </Link>

                <Link
                  to="/my-bookings"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Bookings
                </Link>

                {isAdmin() && (
                  <>
                    <Link
                      to="/rooms"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Manage Rooms
                    </Link>
                    <Link
                      to="/all-bookings"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      All Bookings
                    </Link>
                  </>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-3 border-l pl-4 ml-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      {isAdmin() && (
                        <span className="text-xs text-primary-600 font-semibold">Admin</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
