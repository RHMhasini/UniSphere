import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, toggleRole } = useAuth();
  const navigate = useNavigate();

  const getLinkClass = ({ isActive }) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? "bg-indigo-700 text-white shadow-inner" 
        : "hover:bg-indigo-500 text-indigo-100"
    }`;

  return (
    <nav className="bg-indigo-600 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold flex-shrink-0 flex items-center">
              UniSphere Bookings
            </Link>
            <div className="hidden md:flex space-x-4">
              <NavLink to="/booking/create?resourceId=res_123" className={getLinkClass}>Create Booking</NavLink>
              <NavLink to="/my-bookings" className={getLinkClass}>My Bookings</NavLink>
              {user.role === 'ADMIN' && (
                <NavLink to="/admin/bookings" className={getLinkClass}>All Bookings (Admin)</NavLink>
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
