import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export const useDRVEvidences = () => {
  const [loading, setLoading] = useState(false);

  const fetchEvidences = useCallback(async (registroId) => {
    setLoading(true);
    try {
      const records = await pb.collection('drv_evidencias').getFullList({
        filter: `registro_id = "${registroId}"`,
        sort: '-fecha_carga,-hora_carga',
        expand: 'usuario_carga',
        $autoCancel: false
      });
      return { success: true, data: records };
    } catch (err) {
      toast.error('Error al cargar evidencias');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadEvidence = useCallback(async (registroId, file, comentarios) => {
    setLoading(true);
    try {
      if (file.size > 10485760) throw new Error('El archivo excede los 10MB permitidos');
      
      const formData = new FormData();
      formData.append('evidencia_id', `EVI-${Date.now()}`);
      formData.append('registro_id', registroId);
      formData.append('archivo', file);
      formData.append('fecha_carga', new Date().toISOString().split('T')[0]);
      formData.append('hora_carga', new Date().toTimeString().split(' ')[0].substring(0, 5));
      formData.append('usuario_carga', pb.authStore.model.id);
      if (comentarios) formData.append('comentarios', comentarios);

      const record = await pb.collection('drv_evidencias').create(formData, { $autoCancel: false });
      toast.success('Evidencia subida correctamente');
      return { success: true, data: record };
    } catch (err) {
      toast.error(err.message || 'Error al subir evidencia');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvidence = useCallback(async (id) => {
    setLoading(true);
    try {
      await pb.collection('drv_evidencias').delete(id, { $autoCancel: false });
      toast.success('Evidencia eliminada');
      return { success: true };
    } catch (err) {
      toast.error('Error al eliminar evidencia');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, fetchEvidences, uploadEvidence, deleteEvidence };
};