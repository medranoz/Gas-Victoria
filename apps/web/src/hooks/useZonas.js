import { useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';

export const useZonas = () => {
  const fetchZonas = useCallback(async () => {
    try {
      const records = await pb.collection('zonas_rutas').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      return records;
    } catch (error) {
      console.error('[useZonas] Error fetching zonas:', error);
      throw error;
    }
  }, []);

  const getZona = useCallback(async (id) => {
    try {
      const record = await pb.collection('zonas_rutas').getOne(id, {
        $autoCancel: false
      });
      return record;
    } catch (error) {
      console.error('[useZonas] Error getting zona:', error);
      throw error;
    }
  }, []);

  const createZona = useCallback(async (data) => {
    try {
      const record = await pb.collection('zonas_rutas').create(data, {
        $autoCancel: false
      });
      return record;
    } catch (error) {
      console.error('[useZonas] Error creating zona:', error);
      throw error;
    }
  }, []);

  const updateZona = useCallback(async (id, data) => {
    try {
      const record = await pb.collection('zonas_rutas').update(id, data, {
        $autoCancel: false
      });
      return record;
    } catch (error) {
      console.error('[useZonas] Error updating zona:', error);
      throw error;
    }
  }, []);

  const deleteZona = useCallback(async (id) => {
    try {
      await pb.collection('zonas_rutas').delete(id, {
        $autoCancel: false
      });
      return true;
    } catch (error) {
      console.error('[useZonas] Error deleting zona:', error);
      throw error;
    }
  }, []);

  return {
    fetchZonas,
    getZona,
    createZona,
    updateZona,
    deleteZona
  };
};