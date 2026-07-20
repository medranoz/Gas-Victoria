import { useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useLecturaAPI = () => {
  const { currentUser } = useAuth();

  const createLectura = useCallback(async (tanqueId, data, file) => {
    if (!currentUser) throw new Error("No autenticado");

    const formData = new FormData();
    formData.append('tanque_id', tanqueId);
    formData.append('usuario_lectura', currentUser.id);
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    if (file) {
      formData.append('imagen_evidencia', file);
    }

    return await pb.collection('lecturas_carga').create(formData, { $autoCancel: false });
  }, [currentUser]);

  const listLecturas = useCallback(async (tanqueId, page = 1, perPage = 50) => {
    return await pb.collection('lecturas_carga').getList(page, perPage, {
      filter: `tanque_id = "${tanqueId}"`,
      sort: '-created',
      expand: 'usuario_lectura',
      $autoCancel: false
    });
  }, []);

  const getLastLectura = useCallback(async (tanqueId) => {
    try {
      const res = await pb.collection('lecturas_carga').getList(1, 1, {
        filter: `tanque_id = "${tanqueId}"`,
        sort: '-created',
        expand: 'usuario_lectura',
        $autoCancel: false
      });
      return res.items.length > 0 ? res.items[0] : null;
    } catch (e) {
      return null;
    }
  }, []);

  return {
    createLectura,
    listLecturas,
    getLastLectura
  };
};