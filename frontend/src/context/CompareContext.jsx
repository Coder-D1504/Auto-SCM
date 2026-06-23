import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
    const [compareIds, setCompareIds] = useState(() => {
        const saved = localStorage.getItem('compareIds');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('compareIds', JSON.stringify(compareIds));
        window.dispatchEvent(new Event('compareUpdated'));
    }, [compareIds]);

    useEffect(() => {
        const syncListener = () => {
            const saved = localStorage.getItem('compareIds');
            if (saved) setCompareIds(JSON.parse(saved));
        };
        window.addEventListener('storage', syncListener);
        return () => window.removeEventListener('storage', syncListener);
    }, []);

    const addCompare = (id, e) => {
        if (e) e.preventDefault();
        if (compareIds.includes(id)) return;
        if (compareIds.length >= 4) {
            alert('You can only compare up to 4 vehicles.');
            return;
        }
        setCompareIds([...compareIds, id]);
    };

    const removeCompare = (id, e) => {
        if (e) e.preventDefault();
        setCompareIds(compareIds.filter(cid => cid !== id));
    };

    const clearCompare = () => setCompareIds([]);

    return (
        <CompareContext.Provider value={{ compareIds, addCompare, removeCompare, clearCompare, setCompareIds }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => useContext(CompareContext);
