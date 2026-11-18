import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';
import MobileDrawer from './MobileDrawer';

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Mobile top header */}
        <MobileHeader onOpenMenu={() => setDrawerOpen(true)} />

        {/* Scrollable page container */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 overscroll-contain">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer (slide-over) */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Mobile bottom nav */}
      <BottomNav onOpenMenu={() => setDrawerOpen(true)} />
    </div>
  );
}
