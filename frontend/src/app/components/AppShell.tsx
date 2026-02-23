import React from 'react';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { DesktopLayout } from '../layouts/DesktopLayout';
import { MobileLayout } from '../layouts/MobileLayout';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isMobile } = useResponsiveLayout();

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
};

