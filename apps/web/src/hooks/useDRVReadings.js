import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export const useDRVReadings = () => {
  const [loading, setLoading] = useState(false);

  const fetchReadings = useCallback(async (drvId) => {
    setLoading(true);
    try {
      const records = await pb.collection('drv_registros').getFullList({
        filter: `drv_id = "${drvId}"`,
        sort: '-fecha_captura,-hora_captura',
        expand: 'usuario_responsable',
        $autoCancel: false
      });
      return { success: true, data: records };
    } catch (err) {
      toast.error('Error al cargar registros');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const getReadingById = useCallback(async (id) => {
    setLoading(true);
    try {
      const record = await pb.collection('drv_registros').getOne(id, { $autoCancel: false });
      return { success: true, data: record };
    } catch (err) {
      toast.error('Error al obtener registro');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const createReading = useCallback(async (data) => {
    setLoading(true);
    try {
      if (data.valor_final < data.valor_inicial) throw new Error('El valor final no puede ser menor al inicial');
      
      data.corte = Number((data.valor_final - data.valor_inicial).toFixed(2));
      data.usuario_responsable = pb.authStore.model.id;
      data.registro_id = `REG-${Date.now()}`;
      
      const record = await pb.collection('drv_registros').create(data, { $autoCancel: false });
      toast.success('Registro creado');
      return { success: true, data: record };
    } catch (err) {
      toast.error(err.message || 'Error al crear registro');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReading = useCallback(async (id, data) => {
    setLoading(true);
    try {
      if (data.valor_final && data.valor_inicial && data.valor_final < data.valor_inicial) {
        throw new Error('El valor final no puede ser menor al inicial');
      }
      if (data.valor_final && data.valor_inicial) {
        data.corte = Number((data.valor_final - data.valor_inicial).toFixed(2));
      }
      
      const record = await pb.collection('drv_registros').update(id, data, { $autoCancel: false });
      toast.success('Registro actualizado');
      return { success: true, data: record };
    } catch (err) {
      toast.error(err.message || 'Error al actualizar registro');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const applyCut = useCallback(async (readingId) => {
    setLoading(true);
    try {
      const reading = await pb.collection('drv_registros').getOne(readingId, { $autoCancel: false });
      
      // Update reading status
      await pb.collection('drv_registros').update(readingId, {
        estado_registro: 'Corte Aplicado'
      }, { $autoCancel: false });

      // Update DRV's initial value
      await pb.collection('drv').update(reading.drv_id, {
        valor_inicial_actual: reading.valor_final
      }, { $autoCancel: false });

      // Create next pending reading
      await pb.collection('drv_registros').create({
        registro_id: `REG-${Date.now()}`,
        drv_id: reading.drv_id,
        valor_inicial: reading.valor_final,
        valor_final: reading.valor_final,
        corte: 0,
        fecha_captura: new Date().toISOString().split('T')[0],
        hora_captura: new Date().toTimeString().split(' ')[0].substring(0, 5),
        usuario_responsable: pb.authStore.model.id,
        estado_registro: 'Pendiente'
      }, { $autoCancel: false });

      toast.success('Corte aplicado correctamente');
      return { success: true };
    } catch (err) {
      toast.error('Error al aplicar corte');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReading = useCallback(async (id) => {
    setLoading(true);
    try {
      await pb.collection('drv_registros').delete(id, { $autoCancel: false });
      toast.success('Registro eliminado');
      return { success: true };
    } catch (err) {
      toast.error('Error al eliminar registro');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, fetchReadings, getReadingById, createReading, updateReading, applyCut, deleteReading };
};