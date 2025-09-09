import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-mission-bg-primary text-mission-text-primary mission-grid">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14 h-[calc(100vh-3.5rem)]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto bg-mission-bg-primary">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;