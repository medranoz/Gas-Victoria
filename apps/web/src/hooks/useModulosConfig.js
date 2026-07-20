import { useState, useCallback, useEffect, useRef } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

// Valid collections based on current schema
export const VALID_COLLECTIONS = [
  'users', 'zonas', 'ventas', 'clientes', 'recordatorios_clientes', 
  'notificaciones', 'historial_actividades', 'configuracion', 
  'zonas_rutas', 'costos_zonas', 'tanques_carga', 'proveedores', 
  'modulos_config', 'logotipos', 'drv', 'drv_cortes', 
  'estaciones', 'estacion_tanques', 'estacion_drv', 'control_recepcion'
];

export const useModulosConfig = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'error'
  const [lastSync, setLastSync] = useState(null);
  
  const fetchTimeoutRef = useRef(null);
  const activeRequestRef = useRef(null); // Ref to hold AbortController at hook level

  const fetchModules = useCallback(async (retryCount = 0) => {
    // Implement request deduplication
    if (activeRequestRef.current) {
      console.log(`[useModulosConfig] Aborting previous pending request.`);
      activeRequestRef.current.abort();
    }
    const controller = new AbortController();
    activeRequestRef.current = controller;

    setLoading(true);
    setSyncStatus('syncing');
    const startTime = Date.now();
    console.log(`[useModulosConfig] Fetching modules... (Attempt ${retryCount + 1})`);

    try {
      const records = await pb.collection('modulos_config').getFullList({
        sort: 'orden',
        $autoCancel: false,
        signal: controller.signal
      });
      
      const duration = Date.now() - startTime;
      console.log(`[useModulosConfig] Fetched ${records.length} modules successfully in ${duration}ms.`);
      
      setModules(records);
      setSyncStatus('synced');
      setLastSync(new Date());
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError' || err.isAbort) {
        console.log(`[useModulosConfig] Request aborted after ${Date.now() - startTime}ms.`);
        return; // Don't trigger error states for expected cancellations
      }
      
      console.error(`[useModulosConfig] Error fetching modules after ${Date.now() - startTime}ms:`, err);
      
      // Retry logic for connection errors (up to 3 retries with backoff)
      if (retryCount < 3 && (!err.status || err.status >= 500)) {
        const backoff = Math.pow(2, retryCount) * 1000;
        console.log(`[useModulosConfig] Retrying in ${backoff}ms...`);
        setTimeout(() => fetchModules(retryCount + 1), backoff);
        return;
      }
      
      setError(err.message);
      setSyncStatus('error');
      toast.error('Error al sincronizar módulos de configuración');
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
        setLoading(false);
      }
    }
  }, []);

  // Debounced fetch for rapid updates
  const debouncedFetch = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchModules();
    }, 300);
  }, [fetchModules]);

  useEffect(() => {
    fetchModules();
    
    // Real-time subscription
    let isSubscribed = false;
    const subscribe = async () => {
      try {
        await pb.collection('modulos_config').subscribe('*', function (e) {
          console.log('[useModulosConfig] Realtime update received:', e.action);
          debouncedFetch();
        });
        isSubscribed = true;
      } catch (err) {
        console.error('[useModulosConfig] Failed to subscribe to modulos_config', err);
      }
    };
    
    if (pb.authStore.isValid) {
      subscribe();
    }

    return () => {
      // Abort any pending requests on unmount
      if (activeRequestRef.current) {
        console.log('[useModulosConfig] Unmounting - Aborting pending requests.');
        activeRequestRef.current.abort();
      }
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      if (isSubscribed) pb.collection('modulos_config').unsubscribe('*').catch(console.error);
    };
  }, [fetchModules, debouncedFetch]);

  const validateModule = (data, currentId = null) => {
    const errors = {};
    if (!data.nombre || data.nombre.length < 3) errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    if (!data.orden || data.orden < 1) errors.orden = 'El orden debe ser un número positivo';
    if (!['Header Principal', 'Sección Dashboard'].includes(data.ubicacion)) errors.ubicacion = 'Ubicación inválida';
    
    // Check uniqueness
    const nameExists = modules.some(m => m.nombre.toLowerCase() === data.nombre?.toLowerCase() && m.id !== currentId);
    if (nameExists) errors.nombre = 'Ya existe un módulo con este nombre';
    
    const orderExists = modules.some(m => m.orden === parseInt(data.orden) && m.id !== currentId);
    if (orderExists) errors.orden = 'Ya existe un módulo con este orden';

    // Check collections
    if (data.colecciones && Array.isArray(data.colecciones)) {
      const invalidCols = data.colecciones.filter(c => !VALID_COLLECTIONS.includes(c));
      if (invalidCols.length > 0) {
        errors.colecciones = `Colecciones inválidas: ${invalidCols.join(', ')}`;
      }
    }

    return errors;
  };

  const getModuleIntegrity = (mod) => {
    const issues = [];
    let status = 'valid'; // 'valid' | 'warning' | 'error'

    if (!mod.nombre) { issues.push('Nombre faltante'); status = 'error'; }
    if (!mod.icono) { issues.push('Icono faltante'); status = 'warning'; }
    if (!Array.isArray(mod.roles_permitidos)) { issues.push('Formato de roles inválido'); status = 'warning'; }
    
    if (!mod.colecciones) {
      issues.push('Campo colecciones faltante');
      status = 'warning';
    } else if (!Array.isArray(mod.colecciones)) {
      issues.push('Formato de colecciones inválido');
      status = 'error';
    } else {
      const invalid = mod.colecciones.filter(c => !VALID_COLLECTIONS.includes(c));
      if (invalid.length > 0) {
        issues.push(`Colecciones no encontradas: ${invalid.join(', ')}`);
        status = 'error';
      }
    }

    return { status, issues };
  };

  const repairModule = async (mod) => {
    console.log(`[useModulosConfig] Attempting to repair module: ${mod.id}`);
    const updates = {};
    let needsUpdate = false;

    if (!mod.colecciones || !Array.isArray(mod.colecciones)) {
      updates.colecciones = [];
      needsUpdate = true;
    }
    if (!Array.isArray(mod.roles_permitidos)) {
      updates.roles_permitidos = [];
      needsUpdate = true;
    }
    if (typeof mod.estado !== 'boolean') {
      updates.estado = true;
      needsUpdate = true;
    }

    if (needsUpdate) {
      try {
        await pb.collection('modulos_config').update(mod.id, updates, { $autoCancel: false });
        toast.success(`Módulo ${mod.nombre} reparado`);
        return true;
      } catch (err) {
        toast.error(`Error reparando ${mod.nombre}`);
        return false;
      }
    }
    return true; // No repair needed
  };

  const createModule = async (data) => {
    setSyncStatus('syncing');
    try {
      const record = await pb.collection('modulos_config').create(data, { $autoCancel: false });
      toast.success('Módulo creado exitosamente');
      return { success: true, data: record };
    } catch (err) {
      setSyncStatus('error');
      toast.error(err.message || 'Error al crear módulo');
      return { success: false, error: err };
    }
  };

  const updateModule = async (id, data) => {
    setSyncStatus('syncing');
    try {
      const record = await pb.collection('modulos_config').update(id, data, { $autoCancel: false });
      toast.success('Módulo actualizado exitosamente');
      return { success: true, data: record };
    } catch (err) {
      setSyncStatus('error');
      toast.error(err.message || 'Error al actualizar módulo');
      return { success: false, error: err };
    }
  };

  const deleteModule = async (id) => {
    setSyncStatus('syncing');
    try {
      await pb.collection('modulos_config').delete(id, { $autoCancel: false });
      toast.success('Módulo eliminado exitosamente');
      return { success: true };
    } catch (err) {
      setSyncStatus('error');
      toast.error(err.message || 'Error al eliminar módulo');
      return { success: false, error: err };
    }
  };

  const syncNow = () => {
    fetchModules();
  };

  return {
    modules,
    loading,
    error,
    syncStatus,
    lastSync,
    refreshModules: fetchModules,
    validateModule,
    getModuleIntegrity,
    repairModule,
    createModule,
    updateModule,
    deleteModule,
    syncNow
  };
};