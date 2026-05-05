import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/40">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)}/>
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-10">
            {/* Page content will be rendered here via Outlet */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
