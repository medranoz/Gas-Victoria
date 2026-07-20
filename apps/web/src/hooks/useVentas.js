import pb from '@/lib/pocketbaseClient.js';

export const useVentas = () => {
  const fetchVentas = async () => {
    try {
      // Basic pagination, no expand or sort to avoid 400 ClientResponseError
      const records = await pb.collection('ventas').getList(1, 100, {
        $autoCancel: false
      });
      return records.items || [];
    } catch (error) {
      console.error('[fetchVentas] Error fetching ventas:', error);
      return [];
    }
  };

  const fetchClientes = async () => {
    try {
      const records = await pb.collection('clientes').getFullList({
        $autoCancel: false
      });
      return records || [];
    } catch (error) {
      console.error('[fetchClientes] Error fetching clientes:', error);
      return [];
    }
  };

  const fetchZonasRutas = async () => {
    try {
      const records = await pb.collection('zonas_rutas').getFullList({
        $autoCancel: false
      });
      return records || [];
    } catch (error) {
      console.error('[fetchZonasRutas] Error fetching zonas_rutas:', error);
      return [];
    }
  };

  const fetchDespachadores = async () => {
    try {
      const records = await pb.collection('users').getFullList({
        filter: 'role = "Despachador"',
        $autoCancel: false
      });
      return records || [];
    } catch (error) {
      console.error('[fetchDespachadores] Error fetching despachadores:', error);
      return [];
    }
  };

  const fetchTanques = async () => {
    try {
      const records = await pb.collection('tanques').getFullList({
        $autoCancel: false
      });
      return records || [];
    } catch (error) {
      console.error('[fetchTanques] Error fetching tanques (collection might not exist yet):', error);
      return [];
    }
  };

  const fetchCostosZonas = async () => {
    try {
      const records = await pb.collection('costos_zonas').getFullList({
        $autoCancel: false
      });
      return records || [];
    } catch (error) {
      console.error('[fetchCostosZonas] Error fetching costos_zonas:', error);
      return [];
    }
  };

  return {
    fetchVentas,
    fetchClientes,
    fetchZonasRutas,
    fetchDespachadores,
    fetchTanques,
    fetchCostosZonas
  };
};