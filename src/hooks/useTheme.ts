import { useState } from 'react';
import { leseTheme, type Theme, wendeThemeAn } from '../lib/theme';

/** Farbschema für den Umschalter in den Einstellungen; angewendet wird sofort. */
export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => (typeof window === 'undefined' ? 'system' : leseTheme()));
  return [
    theme,
    (t) => {
      setTheme(t);
      wendeThemeAn(t);
    },
  ];
}
