export const THEME_STORAGE_KEY = 'theme';

/** 06:00–17:59 → light; 18:00–05:59 → dark (hora local del navegador). */
export function getTimeBasedTheme(now: Date = new Date()): 'light' | 'dark' {
  const hour = now.getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

/** Preferencia guardada por el usuario, o tema según hora si es la primera visita. */
export function resolveInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage blocked */
  }

  return getTimeBasedTheme();
}

/** Script síncrono en <head> para evitar flash antes de hidratar React. */
export function themeInitScriptContent(): string {
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var d=document.documentElement;if(s==='dark'||s==='light'){d.classList.toggle('dark',s==='dark');return}var h=new Date().getHours();d.classList.toggle('dark',h<6||h>=18);}catch(e){}})();`;
}
