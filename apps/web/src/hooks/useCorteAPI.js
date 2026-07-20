import { useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useCorteAPI = () => {
  const { currentUser } = useAuth();

  const createCorte = useCallback(async (data, file) => {
    if (!currentUser) throw new Error("No autenticado");

    const formData = new FormData();
    formData.append('usuario_corte', currentUser.id);
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    if (file) {
      formData.append('imagen_lectura_b', file);
    }

    const corte = await pb.collection('cortes_carga').create(formData, { $autoCancel: false });

    // AUTO-CAPTURE LECTURA B
    if (data.estado_corte === 'Autorizado' || data.estado_corte === 'Completado') {
      const lecturaFormData = new FormData();
      lecturaFormData.append('tanque_id', data.tanque_id);
      lecturaFormData.append('tipo_lectura', 'Lectura B');
      lecturaFormData.append('carga_disponible_porcentaje', data.carga_final_porcentaje);
      lecturaFormData.append('carga_disponible_litros', data.carga_disponible_litros_final);
      lecturaFormData.append('carga_faltante', data.carga_faltante_final);
      lecturaFormData.append('temperatura', data.temperatura_final);
      lecturaFormData.append('usuario_lectura', currentUser.id);
      
      if (file) {
        lecturaFormData.append('imagen_evidencia', file);
      }
      
      try {
        await pb.collection('lecturas_carga').create(lecturaFormData, { $autoCancel: false });
      } catch (e) {
        console.error("Warning: Corte created but auto-capture of Lectura B failed.", e);
      }
    }

    return corte;
  }, [currentUser]);

  const updateCorte = useCallback(async (id, data) => {
    return await pb.collection('cortes_carga').update(id, data, { $autoCancel: false });
  }, []);

  const listCortes = useCallback(async (tanqueId, filterStr = '', page = 1, perPage = 50) => {
    const baseFilter = `tanque_id = "${tanqueId}"`;
    const finalFilter = filterStr ? `${baseFilter} && (${filterStr})` : baseFilter;

    return await pb.collection('cortes_carga').getList(page, perPage, {
      filter: finalFilter,
      sort: '-created',
      expand: 'usuario_corte,drv_id',
      $autoCancel: false
    });
  }, []);

  const getLastDRVCorte = useCallback(async (drvId) => {
    try {
      const res = await pb.collection('drv_cortes').getList(1, 1, {
        filter: `drv_id = "${drvId}"`,
        sort: '-created',
        $autoCancel: false
      });
      return res.items.length > 0 ? res.items[0] : null;
    } catch (e) {
      return null;
    }
  }, []);

  return {
    createCorte,
    updateCorte,
    listCortes,
    getLastDRVCorte
  };
};