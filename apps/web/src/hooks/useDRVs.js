import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { generateDRVId, logAuditEvent } from '@/lib/drvUtils.js';

export const useDRVs = () => {
  const [loading, setLoading] = useState(false);

  const fetchDRVs = useCallback(async (filterStr = '') => {
    setLoading(true);
    try {
      const records = await pb.collection('drv').getFullList({
        sort: '-created',
        filter: filterStr,
        expand: 'usuario_creacion',
        $autoCancel: false
      });
      return { success: true, data: records };
    } catch (err) {
      toast.error('Error al cargar DRVs');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDRVById = useCallback(async (id) => {
    setLoading(true);
    try {
      const record = await pb.collection('drv').getOne(id, {
        expand: 'usuario_creacion',
        $autoCancel: false
      });
      return { success: true, data: record };
    } catch (err) {
      toast.error('Error al obtener DRV');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const createDRV = useCallback(async (data) => {
    setLoading(true);
    try {
      if (data.vi_actual === undefined || data.vi_actual < 0) {
        throw new Error("El Valor Inicial (VI) debe ser 0 o un valor positivo.");
      }
      
      const newId = await generateDRVId();
      data.drv_id = newId;
      data.usuario_creacion = pb.authStore.model.id;
      
      const record = await pb.collection('drv').create(data, { $autoCancel: false });
      
      await logAuditEvent('create', 'drv', record.id, pb.authStore.model.id, { drv_id: record.drv_id });
      toast.success('DRV creado exitosamente');
      return { success: true, data: record };
    } catch (err) {
      toast.error(err.message || 'Error al crear DRV');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDRV = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const record = await pb.collection('drv').update(id, data, { $autoCancel: false });
      await logAuditEvent('update', 'drv', record.id, pb.authStore.model.id, { updated_fields: Object.keys(data) });
      toast.success('DRV actualizado exitosamente');
      return { success: true, data: record };
    } catch (err) {
      toast.error(err.message || 'Error al actualizar DRV');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDRV = useCallback(async (id) => {
    setLoading(true);
    try {
      await pb.collection('drv').delete(id, { $autoCancel: false });
      await logAuditEvent('delete', 'drv', id, pb.authStore.model.id, { message: 'DRV eliminado permanentemente' });
      toast.success('DRV eliminado exitosamente');
      return { success: true };
    } catch (err) {
      toast.error('Error al eliminar DRV');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, fetchDRVs, getDRVById, createDRV, updateDRV, deleteDRV, generateNextDrvId: generateDRVId };
};