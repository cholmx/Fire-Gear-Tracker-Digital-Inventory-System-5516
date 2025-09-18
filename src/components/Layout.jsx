import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import UsageLimitBanner from './UsageLimitBanner';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-mission-bg-primary text-mission-text-primary mission-grid">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <UsageLimitBanner />
      <div className="flex pt-20 min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto bg-mission-bg-primary p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;