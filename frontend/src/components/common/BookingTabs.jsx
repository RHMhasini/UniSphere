import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BookingTabs = () => {
  const { user } = useAuth();

  const getTabClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
      isActive
        ? 'bg-[#2563eb] text-white shadow-md'
        : 'bg-white text-[#4a5568] hover:bg-gray-50 border border-gray-200'
    }`;

  return (
    <div className="flex gap-3 mb-6 p-1">
      <NavLink to="/dashboard/bookings/create" className={getTabClass}>
        Create Booking
      </NavLink>
      <NavLink to="/dashboard/bookings" className={getTabClass} end>
        My Bookings
      </NavLink>
      {user?.role === 'ADMIN' && (
        <NavLink to="/dashboard/bookings/admin" className={getTabClass}>
          All Bookings (Admin)
        </NavLink>
      )}
    </div>
  );
};

export default BookingTabs;
