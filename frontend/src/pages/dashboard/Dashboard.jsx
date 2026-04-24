import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar/Sidebar';
import DashboardNavbar from '../../components/dashboard/Navbar/DashboardNavbar';

const Dashboard = ({ theme, toggleTheme }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="dashboard-wrapper flex min-h-screen mesh-background text-slate-800 dark:text-slate-100">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <Sidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <DashboardNavbar onOpenMobileNav={() => setMobileNavOpen(true)} theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
