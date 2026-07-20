import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export const useATQs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchATQs = useCallback(async (page = 1, perPage = 50, filter = '') => {
    setLoading(true);
    setError(null);
    try {
      const result = await pb.collection('atqs').getList(page, perPage, {
        sort: '-created',
        filter: filter,
        $autoCancel: false
      });
      return { success: true, data: result };
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar ATQs';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const getATQById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('atqs').getOne(id, { expand: 'created_by,updated_by', $autoCancel: false });
      return { success: true, data: record };
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar ATQ';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateNextATQId = useCallback(async () => {
    try {
      const allATQs = await pb.collection('atqs').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      
      if (allATQs.length === 0) {
        return 'ATQ-0001';
      }

      const numbers = allATQs
        .map(atq => {
          const match = atq.atq_id.match(/ATQ-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => !isNaN(num));

      const maxNumber = Math.max(...numbers, 0);
      const nextNumber = maxNumber + 1;
      return `ATQ-${String(nextNumber).padStart(4, '0')}`;
    } catch (err) {
      console.error('Error generating ATQ ID:', err);
      return 'ATQ-0001';
    }
  }, []);

  const createATQ = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        id_cre: data.id_cre?.trim(), // Ensure clean string, no format restrictions
        placa: data.placa?.toUpperCase(),
        activo: true,
        created_by: pb.authStore.model.id,
        updated_by: pb.authStore.model.id
      };
      
      // Ensure empty dates are sent as empty string to PocketBase
      if (!payload.fecha_mantenimiento) {
        payload.fecha_mantenimiento = "";
      }

      const record = await pb.collection('atqs').create(payload, { $autoCancel: false });
      
      await pb.collection('atqs_audit').create({
        atq_id: record.id,
        accion: 'CREATE',
        usuario_id: pb.authStore.model.id,
        valores_nuevos: record
      }, { $autoCancel: false });

      toast.success('ATQ creado exitosamente');
      return { success: true, data: record };
    } catch (err) {
      const errorMsg = err.message || 'Error al crear ATQ';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateATQ = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const oldRecord = await pb.collection('atqs').getOne(id, { $autoCancel: false });
      
      const payload = {
        ...data,
        id_cre: data.id_cre?.trim(), // Ensure clean string, no format restrictions
        placa: data.placa?.toUpperCase(),
        updated_by: pb.authStore.model.id
      };

      if (!payload.fecha_mantenimiento) {
        payload.fecha_mantenimiento = "";
      }
      
      const record = await pb.collection('atqs').update(id, payload, { $autoCancel: false });

      await pb.collection('atqs_audit').create({
        atq_id: record.id,
        accion: 'UPDATE',
        usuario_id: pb.authStore.model.id,
        valores_anteriores: oldRecord,
        valores_nuevos: record
      }, { $autoCancel: false });

      toast.success('ATQ actualizado exitosamente');
      return { success: true, data: record };
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar ATQ';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteATQ = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const oldRecord = await pb.collection('atqs').getOne(id, { $autoCancel: false });
      
      const record = await pb.collection('atqs').update(id, { 
        activo: false, 
        estado_actual: 'INACTIVO',
        updated_by: pb.authStore.model.id 
      }, { $autoCancel: false });

      await pb.collection('atqs_audit').create({
        atq_id: record.id,
        accion: 'DELETE',
        usuario_id: pb.authStore.model.id,
        valores_anteriores: oldRecord,
        valores_nuevos: record
      }, { $autoCancel: false });

      toast.success('ATQ desactivado exitosamente');
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Error al desactivar ATQ';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateATQ = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const oldRecord = await pb.collection('atqs').getOne(id, { $autoCancel: false });
      
      const record = await pb.collection('atqs').update(id, { 
        activo: true, 
        estado_actual: 'ACTIVO',
        updated_by: pb.authStore.model.id 
      }, { $autoCancel: false });

      await pb.collection('atqs_audit').create({
        atq_id: record.id,
        accion: 'REACTIVATE',
        usuario_id: pb.authStore.model.id,
        valores_anteriores: oldRecord,
        valores_nuevos: record
      }, { $autoCancel: false });

      toast.success('ATQ reactivado exitosamente');
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Error al reactivar ATQ';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToCSV = useCallback((atqs) => {
    if (!atqs || atqs.length === 0) {
      toast.error('No hay datos para exportar');
      return null;
    }

    const headers = [
      'ATQ ID', 'Placa', 'Registro Contable', 'ID CRE', 'NIV', 
      'Marca', 'Año', 'Modelo', 'Rol', 'Estado', 'Activo', 
      'Fecha Mantenimiento', 'Notificación Mantenimiento', 'Observaciones'
    ];
    
    const rows = atqs.map(atq => [
      atq.atq_id || '',
      atq.placa || '',
      atq.registro_contable || '',
      atq.id_cre || '',
      atq.niv || '',
      atq.marca || '',
      atq.anio || '',
      atq.modelo || '',
      atq.rol_tanque || '',
      atq.estado_actual || '',
      atq.activo ? 'Sí' : 'No',
      atq.fecha_mantenimiento ? new Date(atq.fecha_mantenimiento).toLocaleDateString() : 'N/A',
      atq.notificacion_mantenimiento ? 'Activada' : 'Desactivada',
      atq.observaciones || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `atqs_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Archivo CSV descargado exitosamente');
    return csvContent;
  }, []);

  return {
    loading,
    error,
    fetchATQs,
    getATQById,
    generateNextATQId,
    createATQ,
    updateATQ,
    deleteATQ,
    reactivateATQ,
    exportToCSV
  };
};