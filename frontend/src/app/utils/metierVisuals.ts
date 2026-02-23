import {
  Brush,
  Car,
  Droplets,
  Hammer,
  Paintbrush,
  PlugZap,
  Scissors,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

interface MetierVisualRule {
  keywords: string[];
  icon: LucideIcon;
  toneClass: string;
}

const METIER_VISUAL_RULES: MetierVisualRule[] = [
  {
    keywords: ['plomb', 'sanitaire', 'eau'],
    icon: Droplets,
    toneClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  },
  {
    keywords: ['menuis', 'bois'],
    icon: Hammer,
    toneClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    keywords: ['mecan', 'garage', 'auto'],
    icon: Car,
    toneClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
  {
    keywords: ['coiff', 'barber', 'beaute'],
    icon: Scissors,
    toneClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  },
  {
    keywords: ['elect', 'courant', 'clim'],
    icon: PlugZap,
    toneClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200',
  },
  {
    keywords: ['peint', 'deco', 'decor'],
    icon: Paintbrush,
    toneClass: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  },
  {
    keywords: ['ferr', 'metal', 'soud'],
    icon: Wrench,
    toneClass: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
  },
];

const DEFAULT_METIER_VISUAL = {
  icon: Brush,
  toneClass: 'bg-primary/15 text-primary',
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getMetierVisual(name: string): { icon: LucideIcon; toneClass: string } {
  const normalizedName = normalize(name);
  const match = METIER_VISUAL_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalizedName.includes(keyword))
  );

  if (!match) {
    return DEFAULT_METIER_VISUAL;
  }

  return {
    icon: match.icon,
    toneClass: match.toneClass,
  };
}

