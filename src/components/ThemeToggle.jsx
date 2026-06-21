/**
 * ThemeToggle Component
 * =====================
 * A button that toggles between dark mode (default) and light mode.
 *
 * How it works:
 * 1. On mount, reads the saved preference from localStorage so the
 *    toggle icon correctly reflects the current active theme.
 * 2. On click, it flips the theme, updates localStorage so the
 *    preference survives page refreshes, and adds/removes the
 *    'light-mode' CSS class from <body>.
 *
 * The actual visual theme change is driven entirely by CSS:
 * → Dark mode  : default body styles in index.css
 * → Light mode : styles under the `body.light-mode` selector
 *
 * The inline script in index.html applies the saved class BEFORE
 * React mounts, preventing any flash of the wrong theme on reload.
 */

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

// The localStorage key used to persist the theme preference.
const THEME_STORAGE_KEY = 'qgenix-theme';

export default function ThemeToggle() {
  /**
   * Initialize state by reading from localStorage.
   * - If 'light' is saved → isDark = false (light mode active)
   * - Anything else (null, 'dark') → isDark = true (dark mode default)
   *
   * This lazy initializer runs only once on mount, so the icon
   * immediately shows the correct state without an extra render.
   */
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem(THEME_STORAGE_KEY) !== 'light'
  );

  /**
   * Whenever isDark changes, sync the <body> class.
   * We do this in a useEffect so it always stays consistent even
   * if the state is changed from outside this component in the future.
   */
  useEffect(() => {
    if (isDark) {
      // Dark mode: remove light-mode class and save preference
      document.body.classList.remove('light-mode');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      // Light mode: add light-mode class and save preference
      document.body.classList.add('light-mode');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDark]);

  /**
   * Toggle handler — simply flips the boolean.
   * The useEffect above handles all the side effects.
   */
  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary"
      style={{
        width: '36px',
        height: '36px',
        padding: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      /* Accessible tooltip that reflects current mode */
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Show Sun icon in dark mode (click → go light) */}
      {/* Show Moon icon in light mode (click → go dark) */}
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
