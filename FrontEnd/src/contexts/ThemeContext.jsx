import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const lightTheme = {
  mode: 'light',
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    tertiary: '#f1f3f5',
    card: '#ffffff',
    hover: '#f0f2f5',
  },
  text: {
    primary: '#2d3436',
    secondary: '#636e72',
    tertiary: '#95a5a6',
    link: '#667eea',
  },
  border: {
    primary: 'rgba(108, 117, 125, 0.2)',
    secondary: 'rgba(134, 142, 150, 0.15)',
    hover: 'rgba(102, 126, 234, 0.4)',
  },
  shadow: {
    sm: '0 2px 8px rgba(108, 117, 125, 0.1)',
    md: '0 4px 16px rgba(108, 117, 125, 0.15)',
    lg: '0 8px 32px rgba(108, 117, 125, 0.2)',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  neon: {
    primary: 'rgba(102, 126, 234, 0.5)',
    secondary: 'rgba(102, 126, 234, 0.3)',
  }
};

export const darkTheme = {
  mode: 'dark',
  background: {
    primary: '#1a1a1b',
    secondary: 'rgba(30, 30, 31, 0.6)',
    tertiary: 'rgba(30, 30, 31, 1)',
    card: 'rgba(30, 30, 31, 1)',
    hover: 'rgba(255, 255, 255, 0.05)',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    link: '#667eea',
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    secondary: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(102, 126, 234, 0.6)',
  },
  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 16px rgba(0, 0, 0, 0.5)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.7)',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  neon: {
    primary: 'rgba(102, 126, 234, 0.6)',
    secondary: 'rgba(102, 126, 234, 0.4)',
  }
};

export function ThemeProvider({ children }) {
  // Temporariamente fixo no tema escuro; toggle desativado.
  const [theme] = useState(darkTheme);

  const toggleTheme = () => {
    // Modo claro/escuro desativado por enquanto
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
