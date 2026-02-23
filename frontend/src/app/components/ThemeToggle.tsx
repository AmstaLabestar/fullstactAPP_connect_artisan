import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="min-w-32 justify-start" disabled>
        Mode
      </Button>
    );
  }

  const isDark = theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark');

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="min-w-32 justify-start"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          <span>Mode clair</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span>Mode sombre</span>
        </>
      )}
    </Button>
  );
};

