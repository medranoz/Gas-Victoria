import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export const useClientes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClientes = useCallback(async (filter = '') => {
    setLoading(true);
    setError(null);
    try {
      const records = await pb.collection('clientes').getFullList({
        sort: '-created',
        filter: filter,
        $autoCancel: false
      });
      return { success: true, data: records };
    } catch (err) {
      console.error('[useClientes] Fetch error:', err);
      setError(err);
      toast.error('Error al cargar clientes');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const createCliente = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('clientes').create(data, { $autoCancel: false });
      toast.success('Cliente creado exitosamente');
      return { success: true, data: record };
    } catch (err) {
      console.error('[useClientes] Create error:', err);
      setError(err);
      toast.error(err.message || 'Error al crear cliente');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCliente = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('clientes').update(id, data, { $autoCancel: false });
      toast.success('Cliente actualizado exitosamente');
      return { success: true, data: record };
    } catch (err) {
      console.error('[useClientes] Update error:', err);
      setError(err);
      toast.error(err.message || 'Error al actualizar cliente');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCliente = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await pb.collection('clientes').delete(id, { $autoCancel: false });
      toast.success('Cliente eliminado exitosamente');
      return { success: true };
    } catch (err) {
      console.error('[useClientes] Delete error:', err);
      setError(err);
      toast.error('Error al eliminar cliente');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    loading, 
    error, 
    fetchClientes, 
    createCliente, 
    updateCliente, 
    deleteCliente 
  };
};