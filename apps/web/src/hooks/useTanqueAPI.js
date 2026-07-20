import { useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useTanqueAPI = () => {
  const { currentUser } = useAuth();

  const generateTanqueNumber = useCallback(async () => {
    try {
      const records = await pb.collection('tanques_carga').getList(1, 1, {
        sort: '-numero_tanque',
        $autoCancel: false
      });
      if (records.items.length > 0) {
        const lastNumStr = records.items[0].numero_tanque;
        const lastNum = parseInt(lastNumStr.replace('TQ-', ''), 10);
        if (!isNaN(lastNum)) {
          return `TQ-${String(lastNum + 1).padStart(4, '0')}`;
        }
      }
      return 'TQ-0001';
    } catch (error) {
      console.error("[useTanqueAPI] Error generating tank number", error);
      return `TQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
  }, []);

  const fetchATQs = useCallback(async () => {
    try {
      const records = await pb.collection('atqs').getFullList({
        filter: 'rol_tanque="DE TRASPASO" && estado_actual="ACTIVO"',
        $autoCancel: false
      });
      return records.map(r => ({
        id: r.id,
        atq_id: r.atq_id,
        id_cre: r.id_cre,
        marca: r.marca,
        modelo: r.modelo,
        anio: r.anio,
        rol_tanque: r.rol_tanque,
        estado_actual: r.estado_actual
      }));
    } catch (error) {
      console.error("[useTanqueAPI] Error fetching ATQs:", error);
      throw error;
    }
  }, []);

  const createTanque = useCallback(async (data) => {
    if (!currentUser) throw new Error("No autenticado");
    try {
      const payload = {
        ...data,
        usuario_creacion: currentUser.id
      };
      return await pb.collection('tanques_carga').create(payload, { $autoCancel: false });
    } catch (error) {
      console.error("[useTanqueAPI] Error creating tanque:", error);
      throw error;
    }
  }, [currentUser]);

  const updateTanque = useCallback(async (id, data, file = null) => {
    try {
      let payload = data;
      if (file) {
        payload = new FormData();
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined && data[key] !== null) {
            payload.append(key, data[key]);
          }
        });
        payload.append('imagen_lectura_a', file);
      }
      return await pb.collection('tanques_carga').update(id, payload, { $autoCancel: false });
    } catch (error) {
      console.error("[useTanqueAPI] Error updating tanque:", error);
      throw error;
    }
  }, []);

  const getTanque = useCallback(async (id) => {
    try {
      return await pb.collection('tanques_carga').getOne(id, { 
        expand: 'drv_id,proveedor_id,estacion_id,usuario_creacion',
        $autoCancel: false 
      });
    } catch (error) {
      console.error("[useTanqueAPI] Error getting tanque:", error);
      throw error;
    }
  }, []);

  const listTanques = useCallback(async (filters = '', page = 1, perPage = 50, sort = '-created') => {
    try {
      return await pb.collection('tanques_carga').getList(page, perPage, {
        filter: filters,
        sort: sort,
        expand: 'drv_id,proveedor_id,estacion_id',
        $autoCancel: false
      });
    } catch (error) {
      console.error("[useTanqueAPI] Error listing tanques:", error);
      throw error;
    }
  }, []);

  const deleteTanque = useCallback(async (id) => {
    try {
      return await pb.collection('tanques_carga').update(id, { estado: 'Desactivado' }, { $autoCancel: false });
    } catch (error) {
      console.error("[useTanqueAPI] Error deleting (deactivating) tanque:", error);
      throw error;
    }
  }, []);

  return {
    generateTanqueNumber,
    fetchATQs,
    createTanque,
    updateTanque,
    getTanque,
    listTanques,
    deleteTanque
  };
};