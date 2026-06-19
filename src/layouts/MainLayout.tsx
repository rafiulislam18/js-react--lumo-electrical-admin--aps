import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)}/>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-4 sm:px-[22px] pt-5 pb-12 max-w-[1320px] 2xl:max-w-[1760px] min-[1920px]:max-w-[2200px] mx-auto">
            {/* Page content will be rendered here via Outlet */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
