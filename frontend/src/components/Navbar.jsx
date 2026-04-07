import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, toggleRole } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-indigo-600 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold flex-shrink-0 flex items-center">
              UniSphere Bookings
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/booking/create?resourceId=res_123" className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">Create Booking</Link>
              <Link to="/my-bookings" className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">My Bookings</Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin/bookings" className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium bg-indigo-700">All Bookings (Admin)</Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-sm border border-indigo-400 p-2 rounded-md bg-indigo-800 flex items-center space-x-3">
              <span>{user.name} <strong>({user.role})</strong></span>
              <button 
                onClick={() => {
                  toggleRole();
                  navigate('/');
                }}
                className="bg-indigo-500 hover:bg-indigo-400 text-xs px-2 py-1 rounded"
              >
                Switch Role
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
