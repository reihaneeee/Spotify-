// src/hooks/useWorks.js
import { useState, useEffect } from 'react';

export const useWorks = (storageKey = 'artist_works') => {
  
  const [works, setWorks] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(works));
  }, [works, storageKey]);

  const addWork = (newWork) => {
    setWorks((prev) => [...prev, { ...newWork, id: Date.now().toString() }]);
  };

  const updateWork = (updatedWork) => {
    setWorks((prev) => prev.map((w) => (w.id === updatedWork.id ? updatedWork : w)));
  };

  const deleteWork = (id) => {
    setWorks((prev) => prev.filter((w) => w.id !== id));
  };

  return { works, addWork, updateWork, deleteWork };
};