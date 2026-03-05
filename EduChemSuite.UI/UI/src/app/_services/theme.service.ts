import {Injectable} from '@angular/core';

const DARK_MODE_KEY = 'preferDarkMode';
const DARK_THEME_CLASS = 'dark-theme';
const DARK_STYLE_ID = 'dark-theme-style';

@Injectable({providedIn: 'root'})
export class ThemeService {
  isDarkMode = false;

  loadTheme(): void {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored !== null) {
      this.setDarkMode(stored === 'true');
    }
  }

  setDarkMode(enabled: boolean): void {
    this.isDarkMode = enabled;
    localStorage.setItem(DARK_MODE_KEY, String(enabled));

    if (enabled) {
      document.body.classList.add(DARK_THEME_CLASS);
      this.loadDarkStylesheet();
    } else {
      document.body.classList.remove(DARK_THEME_CLASS);
      this.removeDarkStylesheet();
    }
  }

  toggle(): void {
    this.setDarkMode(!this.isDarkMode);
  }

  private loadDarkStylesheet(): void {
    if (document.getElementById(DARK_STYLE_ID)) return;
    const link = document.createElement('link');
    link.id = DARK_STYLE_ID;
    link.rel = 'stylesheet';
    link.href = 'dark-theme.css';
    document.head.appendChild(link);
  }

  private removeDarkStylesheet(): void {
    const link = document.getElementById(DARK_STYLE_ID);
    if (link) link.remove();
  }
}
