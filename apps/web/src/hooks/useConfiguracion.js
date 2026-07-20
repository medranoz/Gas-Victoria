import { useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';

// Global cache variables to prevent multiple fetches and enable deduplication
let configCache = null;
let configFetchPromise = null;

export const useConfiguracion = () => {
  
  const getZonasRutas = useCallback(async () => {
    try {
      const records = await pb.collection('zonas_rutas').getFullList({ 
        sort: 'nombre',
        $autoCancel: false 
      });
      return { success: true, data: records };
    } catch (error) {
      return { success: false, data: [], message: 'Error al cargar zonas.' };
    }
  }, []);

  const getCostosZonas = useCallback(async () => {
    try {
      const records = await pb.collection('costos_zonas').getFullList({
        expand: 'zona_ruta',
        $autoCancel: false 
      });

      records.sort((a, b) => {
        const nameA = (a.expand?.zona_ruta?.nombre || '').toLowerCase();
        const nameB = (b.expand?.zona_ruta?.nombre || '').toLowerCase();
        
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        
        const unitA = (a.unidad_medida || '').toLowerCase();
        const unitB = (b.unidad_medida || '').toLowerCase();
        
        if (unitA < unitB) return -1;
        if (unitA > unitB) return 1;
        
        return 0;
      });

      return { success: true, data: records };
    } catch (error) {
      return { success: false, data: [], message: 'Error al cargar los costos.' };
    }
  }, []);

  const guardarCosto = useCallback(async (zonaId, unidad, costo, email) => {
    try {
      const costoNum = parseFloat(costo);
      if (isNaN(costoNum) || costoNum <= 0) {
        return { success: false, message: 'El costo debe ser un número mayor a 0.' };
      }

      const payload = {
        zona_ruta: zonaId,
        unidad_medida: unidad,
        costo: costoNum,
        fecha_actualizacion: new Date().toISOString().split('T')[0],
        actualizado_por: email
      };

      const existing = await pb.collection('costos_zonas').getList(1, 1, {
        filter: `zona_ruta="${zonaId}" && unidad_medida="${unidad}"`,
        $autoCancel: false
      });

      if (existing.items.length > 0) {
        await pb.collection('costos_zonas').update(existing.items[0].id, payload, { $autoCancel: false });
        return { success: true, action: 'updated' };
      } else {
        await pb.collection('costos_zonas').create(payload, { $autoCancel: false });
        return { success: true, action: 'created' };
      }
    } catch (error) {
      return { success: false, message: 'Error al guardar el costo.' };
    }
  }, []);

  const eliminarCosto = useCallback(async (id) => {
    try {
      await pb.collection('costos_zonas').delete(id, { $autoCancel: false });
      return { success: true, message: 'Costo eliminado correctamente.' };
    } catch (error) {
      return { success: false, message: 'Error al eliminar el costo.' };
    }
  }, []);

  const getConfiguracion = useCallback(async (forceRefetch = false) => {
    // 1. Initial auth check
    if (!pb.authStore.isValid) {
      return { success: false, record: null, logoUrl: null, nombre_empresa: 'GAS VICTORIA', message: 'No autenticado' };
    }

    // 2. Return cached data if available and not forcing a refetch
    if (configCache && !forceRefetch) {
      return configCache;
    }

    // 3. Request deduplication: return the ongoing promise if already fetching
    if (configFetchPromise && !forceRefetch) {
      return configFetchPromise;
    }

    const fetchWithBackoff = async (retries = 2, baseDelay = 1000) => {
      let attempt = 0;
      while (attempt <= retries) {
        try {
          // Changed timeout from 7000ms to 10000ms to prevent premature aborts
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const records = await pb.collection('configuracion').getList(1, 1, { 
            $autoCancel: false,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          return records;
        } catch (error) {
          // Do not retry on client errors (400, 401, 403, 404)
          if (error.status && error.status >= 400 && error.status < 500) {
            throw error;
          }
          
          if (error.name === 'AbortError' || error.isAbort) {
            console.log('[useConfiguracion] Fetch aborted expectedly.');
            if (attempt === retries) throw error;
          }
          
          if (attempt === retries) throw error;
          
          // Exponential backoff delay
          await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
          attempt++;
        }
      }
    };

    // 4. Create and store the promise for deduplication
    configFetchPromise = (async () => {
      try {
        const records = await fetchWithBackoff();

        if (records && records.items && records.items.length > 0) {
          const record = records.items[0];
          const logoUrl = record.logo_url ? pb.files.getUrl(record, record.logo_url) : null;
          
          configCache = { 
            success: true, 
            record, 
            logoUrl, 
            nombre_empresa: record.nombre_empresa || 'GAS VICTORIA' 
          };
        } else {
          configCache = { 
            success: true, 
            record: null, 
            logoUrl: null, 
            nombre_empresa: 'GAS VICTORIA' 
          };
        }
        
        return configCache;
      } catch (error) {
        // Reset promise on error to allow future retries
        configFetchPromise = null;
        return { 
          success: false, 
          record: null, 
          logoUrl: null, 
          nombre_empresa: 'GAS VICTORIA', 
          message: 'Error de conexión o configuración no disponible.' 
        };
      }
    })();

    return configFetchPromise;
  }, []);

  const actualizarLogo = useCallback(async (file) => {
    try {
      const userId = pb.authStore.model?.id;
      if (!userId) return { success: false, message: 'Usuario no autenticado.' };

      const existingConfig = await pb.collection('configuracion').getList(1, 1, { 
        filter: `nombre_empresa="GAS VICTORIA"`,
        $autoCancel: false 
      });
      
      if (existingConfig.items.length > 0) {
        const formData = new FormData();
        formData.append('logo_url', file);
        formData.append('actualizado_por', userId);
        
        await pb.collection('configuracion').update(existingConfig.items[0].id, formData, { $autoCancel: false });
        
        // Invalidate cache after update
        configCache = null;
        configFetchPromise = null;
        
        return { success: true, message: 'Logotipo actualizado correctamente.' };
      }
      return { success: false, message: 'Configuración no encontrada.' };
    } catch (error) {
      return { success: false, message: 'Error al actualizar logotipo.' };
    }
  }, []);

  return {
    getZonasRutas,
    getCostosZonas,
    guardarCosto,
    eliminarCosto,
    getConfiguracion,
    actualizarLogo
  };
};