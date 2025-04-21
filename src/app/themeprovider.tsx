'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';

// Define available themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  OCEAN_BLUE: 'ocean-blue',
  LAVENDER: 'lavender',
  FOREST: 'forest',
  RUBY: 'ruby'
};

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.LIGHT,
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(THEMES.LIGHT);

  useEffect(() => {
    // Load theme from localStorage on initial render
    const savedTheme = localStorage.getItem('krammy-theme') || THEMES.LIGHT;
    setTheme(savedTheme);
    
    // Apply theme class/attribute to document
    if (savedTheme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
      document.documentElement.removeAttribute('data-theme');
    } else if (savedTheme === THEMES.LIGHT) {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    } else {
      // For custom themes other than light/dark
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('krammy-theme', newTheme);
    
    // Apply theme class/attribute
    if (newTheme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
      document.documentElement.removeAttribute('data-theme');
    } else if (newTheme === THEMES.LIGHT) {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    } else {
      // For custom themes other than light/dark
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);