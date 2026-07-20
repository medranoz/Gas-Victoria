import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';

export const useCalculateTankAvailability = (tankId) => {
  const [data, setData] = useState({
    carga_disponible: 0,
    porcentaje_disponible: 0,
    total_vendido: 0,
    estado: 'gris',
    loading: true,
    tank: null
  });

  const calculate = useCallback(async () => {
    if (!tankId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }
    
    try {
      const tank = await pb.collection('tanques').getOne(tankId, { $autoCancel: false });
      
      // Fetch all completed/pending ventas for this tank
      const ventas = await pb.collection('ventas').getFullList({
        filter: `tanque = "${tankId}" && estado != "cancelado"`,
        $autoCancel: false
      });
      
      const total_vendido = ventas.reduce((sum, v) => sum + (v.cantidad || 0), 0);
      const carga_disponible = Math.max(0, (tank.carga_inicial || 0) - total_vendido);
      const porcentaje_disponible = tank.capacidad ? (carga_disponible / tank.capacidad) * 100 : 0;
      
      let estado = 'gris';
      if (tank.carga_inicial !== undefined && tank.carga_inicial !== null) {
        if (porcentaje_disponible > 50) estado = 'verde';
        else if (porcentaje_disponible >= 20) estado = 'amarillo';
        else estado = 'rojo';
      }

      setData({ 
        carga_disponible, 
        porcentaje_disponible, 
        total_vendido, 
        estado, 
        loading: false,
        tank 
      });
    } catch (error) {
      console.error('[useCalculateTankAvailability] Error:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [tankId]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  return { ...data, refetch: calculate };
};