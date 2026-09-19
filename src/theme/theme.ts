'use client';

import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Ocean-toned palettes
const lightPalette = {
    primary: {
        main: '#0369a1', // Ocean Blue
        light: '#38bdf8',
        dark: '#0c4a6e',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#0d9488', // Teal
        light: '#2dd4bf',
        dark: '#0f766e',
        contrastText: '#ffffff',
    },
    background: {
        default: '#f8fafc', // Slate 50
        paper: '#ffffff',
    },
    text: {
        primary: '#0f172a', // Slate 900
        secondary: '#475569', // Slate 600
    },
    action: {
        hover: alpha('#0369a1', 0.04),
        selected: alpha('#0369a1', 0.08),
    },
};

const darkPalette = {
    primary: {
        main: '#38bdf8', // Bright Sky Blue
        light: '#7dd3fc',
        dark: '#0284c7',
        contrastText: '#0c4a6e',
    },
    secondary: {
        main: '#2dd4bf', // Bright Teal
        light: '#5eead4',
        dark: '#0d9488',
        contrastText: '#0f172a',
    },
    background: {
        default: '#0f172a', // Slate 900
        paper: '#1e293b', // Slate 800
    },
    text: {
        primary: '#f8fafc', // Slate 50
        secondary: '#cbd5e1', // Slate 300
    },
    action: {
        hover: alpha('#38bdf8', 0.08),
        selected: alpha('#38bdf8', 0.12),
    },
};

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
    palette: {
        mode,
        ...(mode === 'light' ? lightPalette : darkPalette),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.02em' },
        h2: { fontWeight: 700, letterSpacing: '-0.01em' },
        h3: { fontWeight: 700, letterSpacing: '-0.01em' },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 500, lineHeight: 1.5 },
        button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: (theme) => ({
                body: {
                    scrollbarColor: mode === 'dark' ? '#334155 #0f172a' : '#cbd5e1 #f1f5f9',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        backgroundColor: 'transparent',
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        borderRadius: 8,
                        backgroundColor: mode === 'dark' ? '#334155' : '#cbd5e1',
                        minHeight: 24,
                        border: `2px solid ${mode === 'dark' ? '#0f172a' : '#f1f5f9'}`,
                    },
                },
            }),
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)',
                        transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                },
                contained: {
                    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    backgroundImage: 'none',
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${mode === 'dark' ? alpha('#fff', 0.08) : alpha('#000', 0.04)}`,
                    boxShadow: mode === 'dark'
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
                filled: {
                    border: '1px solid transparent',
                },
                outlined: {
                    borderWidth: '1px',
                }
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        transition: 'all 0.2s',
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 2px ${mode === 'dark' ? alpha('#38bdf8', 0.2) : alpha('#0369a1', 0.2)}`,
                        }
                    },
                },
            },
        },
    },
});

export default getDesignTokens;
