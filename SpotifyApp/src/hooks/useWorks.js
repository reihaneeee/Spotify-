// src/hooks/useWorks.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

export const useWorks = (initialWorks = []) => {
  const [works, setWorks] = useState(initialWorks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    try {
      // دریافت همزمان آهنگ‌ها و آلبوم‌ها از دیتابیس
      const [songsRes, albumsRes] = await Promise.allSettled([
        apiClient.get('/catalog/songs/'),
        apiClient.get('/catalog/albums/')
      ]);

      let songs = [];
      let albums = [];

      if (songsRes.status === 'fulfilled') {
        const data = songsRes.value.data;
        const list = Array.isArray(data) ? data : (data.results || []);
        songs = list.map(s => ({ ...s, type: 'single' }));
      }

      if (albumsRes.status === 'fulfilled') {
        const data = albumsRes.value.data;
        const list = Array.isArray(data) ? data : (data.results || []);
        albums = list.map(a => ({ ...a, type: 'album' }));
      }

      setWorks([...songs, ...albums]);
      setError(null);
    } catch (err) {
      console.error("Error loading works from server:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const initWorks = (serverWorks) => {
    setWorks(serverWorks);
  };

  const addWork = (newWork) => {
    setWorks((prev) => [newWork, ...prev]);
  };

  const updateWork = (updatedWork) => {
    setWorks((prev) =>
      prev.map((w) => (String(w.id) === String(updatedWork.id) ? updatedWork : w))
    );
  };

  const deleteWork = (id) => {
    setWorks((prev) => prev.filter((w) => String(w.id) !== String(id)));
  };

  return { works, loading, error, refetch: fetchWorks, initWorks, addWork, updateWork, deleteWork };
};