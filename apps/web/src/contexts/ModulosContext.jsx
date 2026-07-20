import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const ModulosContext = createContext(null);

export const useModulos = () => {
  const context = useContext(ModulosContext);
  if (!context) {
    throw new Error('useModulos must be used within ModulosProvider');
  }
  return context;
};

export const getModulePath = (nombre) => {
  const map = {
    'Dashboard': '/dashboard',
    'Clientes': '/clientes',
    'Ventas': '/ventas',
    'Zonas': '/zonas',
    'Proveedores': '/proveedores',
    'Estaciones': '/estaciones',
    'Catálogo de Estaciones': '/estaciones',
    'Dispositivos DRV': '/drv',
    'DRV': '/drv',
    'Recordatorios': '/recordatorios',
    'Reportes': '/reportes',
    'Usuarios': '/usuarios',
    'Configuración': '/configuracion',
    'Control de Carga': '/carga',
    'Carga': '/carga',
    'CONTROL DE CARGA': '/carga',
    'Control Recepción': '/control-recepcion',
    'Control de Recepción': '/control-recepcion',
    'ATQs': '/atqs',
    'Gestión de ATQs': '/atqs',
    'GESTIÓN DE ATQs': '/atqs'
  };
  return map[nombre] || `/${nombre.toLowerCase().replace(/\s+/g, '-')}`;
};

export const ModulosProvider = ({ children }) => {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('syncing');
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);
  
  const channelRef = useRef(null);
  const isSyncingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const refreshModulos = useCallback(async (isLocal = true) => {
    if (!pb.authStore.isValid) {
      setIsLoading(false);
      return false;
    }

    if (isSyncingRef.current) {
      return false;
    }

    isSyncingRef.current = true;
    setSyncStatus('syncing');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort('New sync started');
    }
    abortControllerRef.current = new AbortController();

    try {
      const records = await pb.collection('modulos_config').getFullList({
        filter: 'estado = true',
        sort: 'orden',
        $autoCancel: false,
        signal: abortControllerRef.current.signal
      });
      
      setModules(records || []);
      setSyncStatus('synced');
      setLastSync(new Date());
      setError(null);

      if (isLocal && channelRef.current) {
        channelRef.current.postMessage({ type: 'MODULOS_UPDATED' });
      }
      return true;
    } catch (err) {
      if (err.name === 'AbortError' || err === 'New sync started') {
        return false;
      }
      console.error('[ModulosContext] Fallback fetch error:', err.name, err.message, err);
      setSyncStatus('error');
      setError(err.message || 'Error de conexión al cargar módulos');
      setModules(prev => prev && prev.length > 0 ? prev : []);
      return false;
    } finally {
      isSyncingRef.current = false;
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let isSubscribed = false;
    
    channelRef.current = new BroadcastChannel('modulos_sync');
    const handleMessage = (event) => {
      if (event.data?.type === 'MODULOS_UPDATED' && isMounted) {
        refreshModulos(false);
      }
    };
    channelRef.current.addEventListener('message', handleMessage);

    const initSequence = async () => {
      if (!pb.authStore.isValid) {
        if (isMounted) setIsLoading(false);
        return;
      }

      await refreshModulos(false);
      
      if (isMounted) {
        try {
          await pb.collection('modulos_config').subscribe('*', (e) => {
            if (isMounted) refreshModulos(true);
          });
          isSubscribed = true;
        } catch (err) {
          console.warn('[ModulosContext] Subscription error (Realtime failed). Relying on fallback fetch.', err.message);
        }
      }
    };

    initSequence();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Context unmounted');
      }
      if (channelRef.current) {
        channelRef.current.removeEventListener('message', handleMessage);
        channelRef.current.close();
      }
      if (isSubscribed) {
        try {
          pb.collection('modulos_config').unsubscribe('*').catch(e => {
            console.error('[ModulosContext] Unsubscribe error:', e);
          });
        } catch (e) {
          console.error('[ModulosContext] Unsubscribe sync error:', e);
        }
      }
    };
  }, [refreshModulos]);

  const getActiveModulos = useCallback(() => modules || [], [modules]);
  const getModulosByUbicacion = useCallback((ubicacion) => (modules || []).filter(m => m.ubicacion === ubicacion), [modules]);
  const getModulosByRoles = useCallback((role) => {
    if (!role) return [];
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'superadmin') return modules || [];
    return (modules || []).filter(m => {
      if (!m.roles_permitidos || m.roles_permitidos.length === 0) return true;
      return m.roles_permitidos.map(r => r.toLowerCase()).includes(normalizedRole);
    });
  }, [modules]);

  const value = {
    modules,
    isLoading,
    syncStatus,
    lastSync,
    error,
    refreshModulos,
    getActiveModulos,
    getModulosByUbicacion,
    getModulosByRoles
  };

  return (
    <ModulosContext.Provider value={value}>
      {children}
    </ModulosContext.Provider>
  );
};