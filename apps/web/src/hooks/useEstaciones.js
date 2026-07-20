import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export const useEstaciones = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generateAutoId = async () => {
    try {
      const records = await pb.collection('estaciones').getList(1, 1, {
        sort: '-id',
        filter: 'id ~ "est000"',
        $autoCancel: false
      });

      let nextNumber = 1;
      if (records.items.length > 0) {
        const lastId = records.items[0].id;
        const lastNum = parseInt(lastId.substring(3), 10);
        if (!isNaN(lastNum)) {
          nextNumber = lastNum + 1;
        }
      }
      return 'est' + String(nextNumber).padStart(12, '0');
    } catch (error) {
      const randomFallback = Math.floor(Math.random() * 1000000000000);
      return 'est' + String(randomFallback).padStart(12, '0');
    }
  };

  const fetchEstaciones = useCallback(async (filters = {}, search = '', page = 1, perPage = 50) => {
    setIsLoading(true);
    try {
      let filterSegments = [];
      
      if (filters.rol && filters.rol !== 'all') {
        filterSegments.push(`rol = "${filters.rol}"`);
      }
      if (filters.estado && filters.estado !== 'all') {
        filterSegments.push(`estado_estacion = "${filters.estado}"`);
      }
      if (filters.responsable && filters.responsable !== 'all') {
        filterSegments.push(`responsable_id = "${filters.responsable}"`);
      }
      if (search) {
        filterSegments.push(`(nombre ~ "${search}" || id ~ "${search}")`);
      }
      
      const filterStr = filterSegments.join(' && ');

      const result = await pb.collection('estaciones').getList(page, perPage, {
        sort: '-created',
        filter: filterStr,
        expand: 'responsable_id',
        $autoCancel: false
      });

      // Fetch counts for tanques and drvs using correct collections
      const estacionesWithCounts = await Promise.all(result.items.map(async (est) => {
        const [tanques, drvs] = await Promise.all([
          pb.collection('tanques_carga').getList(1, 1, { filter: `estacion_id="${est.id}"`, $autoCancel: false }).catch(()=>({totalItems:0})),
          pb.collection('estacion_drv').getList(1, 1, { filter: `estacion_id="${est.id}"`, $autoCancel: false }).catch(()=>({totalItems:0}))
        ]);
        return { ...est, tanquesCount: tanques.totalItems, drvsCount: drvs.totalItems };
      }));

      return { ...result, items: estacionesWithCounts };
    } catch (error) {
      console.error('Error fetching estaciones:', error);
      toast.error('Error al cargar las estaciones');
      return { items: [], totalItems: 0, totalPages: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEstacionById = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const estacion = await pb.collection('estaciones').getOne(id, {
        expand: 'responsable_id,colaboradores,usuario_creacion',
        $autoCancel: false
      });

      const tanquesRel = await pb.collection('tanques_carga').getFullList({
        filter: `estacion_id="${id}"`,
        $autoCancel: false
      });

      const drvsRel = await pb.collection('estacion_drv').getFullList({
        filter: `estacion_id="${id}"`,
        expand: 'drv_id',
        $autoCancel: false
      });

      return {
        ...estacion,
        tanques: tanquesRel,
        drvs: drvsRel.map(rel => ({ ...rel.expand?.drv_id, relId: rel.id }))
      };
    } catch (error) {
      console.error('Error fetching estacion detail:', error);
      toast.error('Error al cargar los detalles de la estación');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEstacion = async (data) => {
    setIsLoading(true);
    try {
      const newId = await generateAutoId();
      const payload = {
        ...data,
        id: newId,
        usuario_creacion: pb.authStore.model.id
      };
      const record = await pb.collection('estaciones').create(payload, { $autoCancel: false });
      toast.success('Estación creada exitosamente');
      return { success: true, data: record };
    } catch (error) {
      console.error('Error creating estacion:', error);
      toast.error(error.message || 'Error al crear la estación');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateEstacion = async (id, data) => {
    setIsLoading(true);
    try {
      const record = await pb.collection('estaciones').update(id, data, { $autoCancel: false });
      toast.success('Estación actualizada exitosamente');
      return { success: true, data: record };
    } catch (error) {
      console.error('Error updating estacion:', error);
      toast.error(error.message || 'Error al actualizar la estación');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEstacion = async (id) => {
    setIsLoading(true);
    try {
      await pb.collection('estaciones').delete(id, { $autoCancel: false });
      toast.success('Estación eliminada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('Error deleting estacion:', error);
      toast.error('Error al eliminar la estación');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const associateTanque = async (estacionId, tanqueId) => {
    try {
      await pb.collection('tanques_carga').update(tanqueId, {
        estacion_id: estacionId
      }, { $autoCancel: false });
      return { success: true };
    } catch (error) {
      console.error('Error associating tanque:', error);
      return { success: false, error };
    }
  };

  const removeTanque = async (tanqueId) => {
    try {
      await pb.collection('tanques_carga').update(tanqueId, {
        estacion_id: ""
      }, { $autoCancel: false });
      toast.success('Tanque removido de la estación');
      return { success: true };
    } catch (error) {
      console.error('Error removing tanque:', error);
      toast.error('Error al remover el tanque');
      return { success: false, error };
    }
  };

  const associateDRV = async (estacionId, drvId) => {
    try {
      await pb.collection('estacion_drv').create({
        estacion_id: estacionId,
        drv_id: drvId
      }, { $autoCancel: false });
      return { success: true };
    } catch (error) {
      console.error('Error associating DRV:', error);
      return { success: false, error };
    }
  };

  const removeDRV = async (relId) => {
    try {
      await pb.collection('estacion_drv').delete(relId, { $autoCancel: false });
      toast.success('DRV removido de la estación');
      return { success: true };
    } catch (error) {
      console.error('Error removing DRV:', error);
      toast.error('Error al remover el DRV');
      return { success: false, error };
    }
  };

  const exportToCSV = (estacionesList) => {
    if (!estacionesList || estacionesList.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const exportData = estacionesList.map(est => ({
      'ID Estación': est.id,
      'Nombre': est.nombre,
      'Rol': est.rol,
      'Estado': est.estado_estacion,
      'Responsable': est.expand?.responsable_id?.email || '-',
      'Teléfono': est.telefono || '-',
      'Dirección': `${est.calle || ''} ${est.numero || ''}, ${est.colonia || ''}, ${est.municipio || ''}, ${est.estado || ''}`.trim(),
      'Tanques Asociados': est.tanquesCount || 0,
      'DRVs Asociados': est.drvsCount || 0,
      'Fecha Creación': new Date(est.created).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estaciones");
    XLSX.writeFile(wb, `Estaciones_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return {
    isLoading,
    fetchEstaciones,
    getEstacionById,
    createEstacion,
    updateEstacion,
    deleteEstacion,
    associateTanque,
    removeTanque,
    associateDRV,
    removeDRV,
    exportToCSV
  };
};