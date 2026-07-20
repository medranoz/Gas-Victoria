import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export const useProveedores = () => {
  const [loading, setLoading] = useState(false);

  const fetchProveedores = useCallback(async (filter = '') => {
    setLoading(true);
    try {
      const records = await pb.collection('proveedores').getFullList({
        sort: '-created',
        filter: filter,
        $autoCancel: false
      });
      return { success: true, data: records };
    } catch (err) {
      console.error('Fetch proveedores error:', err);
      toast.error('Error al cargar proveedores');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const getProveedorById = useCallback(async (id) => {
    setLoading(true);
    try {
      const record = await pb.collection('proveedores').getOne(id, { $autoCancel: false });
      return { success: true, data: record };
    } catch (err) {
      console.error('Get proveedor error:', err);
      toast.error('Error al obtener proveedor');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateNextCodigo = useCallback(async () => {
    try {
      const all = await pb.collection('proveedores').getFullList({ sort: '-created', $autoCancel: false });
      if (all.length === 0) return 'PROV-0001';
      
      const numbers = all.map(p => {
        const match = p.codigo_proveedor?.match(/PROV-(\d+)/) || p.codigo_proveedor?.match(/PRV-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      }).filter(n => !isNaN(n));
      
      const max = Math.max(...numbers, 0);
      return `PROV-${String(max + 1).padStart(4, '0')}`;
    } catch (err) {
      console.error('Generate code error:', err);
      return 'PROV-0001';
    }
  }, []);

  const parsePocketBaseError = (err, defaultMsg) => {
    let errorMsg = defaultMsg;
    if (err.status === 400 && err.response?.data) {
      const fieldErrors = Object.entries(err.response.data).map(([field, details]) => `${field}: ${details.message || 'Campo inválido'}`);
      if (fieldErrors.length > 0) {
        errorMsg = `Error de validación:\n${fieldErrors.join('\n')}`;
      }
    }
    return errorMsg;
  };

  const createProveedor = useCallback(async (data) => {
    setLoading(true);
    try {
      const payload = { ...data };
      
      if (!payload.codigo_proveedor || payload.codigo_proveedor.trim() === '') {
        payload.codigo_proveedor = await generateNextCodigo();
      }

      const record = await pb.collection('proveedores').create(payload, { $autoCancel: false });
      toast.success('Proveedor creado exitosamente');
      return { success: true, data: record };
    } catch (err) {
      console.error('Create proveedor error:', err);
      const errorMsg = parsePocketBaseError(err, 'Error al crear proveedor. Verifica los datos.');
      toast.error(errorMsg);
      return { success: false, error: err, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [generateNextCodigo]);

  const updateProveedor = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const record = await pb.collection('proveedores').update(id, data, { $autoCancel: false });
      toast.success('Proveedor actualizado exitosamente');
      return { success: true, data: record };
    } catch (err) {
      console.error('Update proveedor error:', err);
      const errorMsg = parsePocketBaseError(err, 'Error al actualizar proveedor. Verifica los datos.');
      toast.error(errorMsg);
      return { success: false, error: err, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProveedor = useCallback(async (id) => {
    setLoading(true);
    try {
      await pb.collection('proveedores').delete(id, { $autoCancel: false });
      toast.success('Proveedor eliminado exitosamente');
      return { success: true };
    } catch (err) {
      console.error('Delete proveedor error:', err);
      toast.error('Error al eliminar proveedor');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, fetchProveedores, getProveedorById, generateNextCodigo, createProveedor, updateProveedor, deleteProveedor };
};