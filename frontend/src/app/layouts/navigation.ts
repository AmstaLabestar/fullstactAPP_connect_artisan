import { Home, Images, LayoutDashboard, LogIn, UserRoundSearch, type LucideIcon } from 'lucide-react';

export interface NavLink {
  to: string;
  label: string;
}

export interface BottomNavLink extends NavLink {
  icon: LucideIcon;
}

export const PRIMARY_NAV_LINKS: NavLink[] = [
  { to: '/', label: 'Accueil' },
  { to: '/artisans', label: 'Artisans' },
  { to: '/realisations', label: 'Realisations' },
];

export const AUTH_DASHBOARD_LINKS: NavLink[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profil', label: 'Mon profil' },
  { to: '/mes-realisations', label: 'Mes realisations' },
];

export function getBottomNavLinks(isAuthenticated: boolean): BottomNavLink[] {
  return [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/artisans', label: 'Artisans', icon: UserRoundSearch },
    { to: '/realisations', label: 'Realisations', icon: Images },
    isAuthenticated
      ? { to: '/dashboard', label: 'Mon espace', icon: LayoutDashboard }
      : { to: '/login', label: 'Connexion', icon: LogIn },
  ];
}

