import React from 'react';
import { MobileHeader } from '../components/mobile/MobileHeader';
import { MobileDrawer } from '../components/mobile/MobileDrawer';
import { BottomNavigation } from '../components/mobile/BottomNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader onMenuClick={() => setDrawerOpen(true)} />
      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      <main className="pb-20">{children}</main>
      <BottomNavigation />
    </div>
  );
};

