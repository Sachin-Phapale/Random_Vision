import React, { createContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ThemeContext = createContext();

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode ? savedMode : 'dark'; // Default to sleek premium dark mode
  });

  const toggleThemeMode = () => {
    setMode((prevMode) => {
      const nextMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', nextMode);
      return nextMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#b388ff' : '#6200ee',
          },
          secondary: {
            main: '#03dac6',
          },
          background: {
            default: mode === 'dark' ? '#0d0e12' : '#f5f5f7',
            paper: mode === 'dark' ? '#15171e' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#ffffff' : '#1d1d1f',
            secondary: mode === 'dark' ? '#9e9e9e' : '#6e6e73',
          },
        },
        typography: {
          fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontWeight: 800 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 600 },
          h4: { fontWeight: 600 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: {
          borderRadius: 16,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 30,
                padding: '8px 24px',
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-1px)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: mode === 'dark' 
                  ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)' 
                  : '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
                backgroundImage: 'none',
                border: mode === 'dark' ? '1px solid #252836' : '1px solid #eaeaea',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleThemeMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
