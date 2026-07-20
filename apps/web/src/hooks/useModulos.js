import pb from '@/lib/pocketbaseClient.js';

export const useModulos = () => {
  const handleError = (error, defaultMessage) => {
    console.error(`[useModulos] ${defaultMessage}:`, error);
    return error?.response?.message || error?.message || defaultMessage;
  };

  const fetchModulos = async () => {
    try {
      console.log('[useModulos] Fetching modules...');
      const records = await pb.collection('modulos_config').getFullList({
        sort: 'orden',
        $autoCancel: false
      });
      console.log('[useModulos] Fetched modules successfully:', records.length);
      return { exito: true, data: records };
    } catch (error) {
      return { exito: false, error: handleError(error, 'Error al obtener los módulos') };
    }
  };

  const updateModulo = async (id, data) => {
    try {
      console.log(`[useModulos] Updating module ${id} with payload:`, data);
      const record = await pb.collection('modulos_config').update(id, data, { $autoCancel: false });
      console.log(`[useModulos] Successfully updated module ${id}:`, record);
      return { exito: true, data: record };
    } catch (error) {
      return { exito: false, error: handleError(error, `Error al actualizar el módulo ${id}`) };
    }
  };

  const updateModuloOrder = async (id, orden) => {
    return await updateModulo(id, { orden });
  };

  const updateModuloStatus = async (id, estado) => {
    return await updateModulo(id, { estado });
  };

  const updateModuloSection = async (id, ubicacion) => {
    return await updateModulo(id, { ubicacion });
  };

  const updateModuloRoles = async (id, roles_permitidos) => {
    return await updateModulo(id, { roles_permitidos });
  };

  return {
    fetchModulos,
    updateModulo,
    updateModuloOrder,
    updateModuloStatus,
    updateModuloSection,
    updateModuloRoles
  };
};