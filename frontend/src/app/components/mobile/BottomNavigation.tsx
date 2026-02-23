import React from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getBottomNavLinks } from '../../layouts/navigation';

function isActive(pathname: string, to: string) {
  if (to === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(to);
}

export const BottomNavigation: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const items = getBottomNavLinks(isAuthenticated);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <ul className="grid grid-cols-4 gap-1 px-2 py-2">
        {items.map((item) => {
          const active = isActive(location.pathname, item.to);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex min-h-14 flex-col items-center justify-center rounded-lg px-2 text-[11px] font-medium ${
                  active
                    ? 'bg-primary/15 text-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="mb-1 h-4 w-4" />
                <span className="leading-tight">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

