import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Read saved preference, fallback to dark
    const [theme, setTheme] = useState(() => localStorage.getItem('autoscm-theme') || 'dark');

    useEffect(() => {
        // Apply theme class to <html> so CSS vars cascade everywhere
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('autoscm-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
