import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { updateNextCycleVI, logAuditEvent } from '@/lib/drvUtils.js';

export const useCalculateCut = () => {
  const [isLoading, setIsLoading] = useState(false);

  const validateCut = (vi, vf) => {
    const viNum = parseFloat(vi);
    const vfNum = parseFloat(vf);
    
    if (isNaN(viNum) || isNaN(vfNum)) return { valid: false, error: 'VI y VF deben ser números válidos.' };
    if (vfNum <= viNum) return { valid: false, error: 'El valor final debe ser mayor al valor inicial del DRV.' };
    
    return { valid: true, corte: Number((vfNum - viNum).toFixed(4)) };
  };

  const saveCut = async (drvId, vi, vf, userId, observaciones) => {
    setIsLoading(true);
    try {
      const validation = validateCut(vi, vf);
      if (!validation.valid) throw new Error(validation.error);

      const currentTime = new Date().toISOString();

      const cutData = {
        drv_id: drvId,
        vi: parseFloat(vi),
        vf: parseFloat(vf),
        corte: validation.corte,
        fecha_hora_vi: currentTime,
        fecha_hora_vf: currentTime,
        usuario: userId,
      };
      
      const newCut = await pb.collection('drv_cortes').create(cutData, { $autoCancel: false });

      // Update next cycle VI
      const nextVIUpdates = updateNextCycleVI(vf, currentTime, userId);
      await pb.collection('drv').update(drvId, nextVIUpdates, { $autoCancel: false });

      await logAuditEvent('cut', 'reading', newCut.id, userId, { vi, vf, corte: validation.corte, observaciones });

      toast.success('Corte registrado y DRV actualizado.');
      return { success: true, data: newCut };
    } catch (error) {
      toast.error(error.message || 'Error al guardar el corte.');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const getCutHistory = useCallback(async ({ page = 1, perPage = 50, drvId, startDate, endDate }) => {
    setIsLoading(true);
    try {
      let filterSegments = [];
      if (drvId && drvId !== 'all') filterSegments.push(`drv_id = "${drvId}"`);
      if (startDate) filterSegments.push(`fecha_hora_vf >= "${startDate} 00:00:00"`);
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        filterSegments.push(`fecha_hora_vf < "${nextDay.toISOString().split('T')[0]} 00:00:00"`);
      }
      
      return await pb.collection('drv_cortes').getList(page, perPage, {
        sort: '-fecha_hora_vf',
        filter: filterSegments.join(' && '),
        expand: 'drv_id,usuario',
        $autoCancel: false
      });
    } catch (error) {
      toast.error('Error al cargar historial.');
      return { items: [], totalItems: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCut = async (id) => {
    try {
      await pb.collection('drv_cortes').delete(id, { $autoCancel: false });
      await logAuditEvent('delete', 'reading', id, pb.authStore.model.id, { message: 'Corte eliminado' });
      toast.success('Corte eliminado');
      return true;
    } catch (e) {
      toast.error('Error al eliminar corte. Permisos insuficientes.');
      return false;
    }
  };

  return { isLoading, validateCut, saveCut, getCutHistory, deleteCut };
};