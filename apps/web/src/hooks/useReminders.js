import { useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useNotificationSystem } from './useNotificationSystem';

export const useReminders = () => {
  const { createNotification } = useNotificationSystem();

  const getInactiveClients = useCallback(async (daysInactive = 30) => {
    try {
      const clientes = await pb.collection('clientes').getFullList({ $autoCancel: false });
      const inactiveClients = [];
      const today = new Date();

      for (const cliente of clientes) {
        const ventas = await pb.collection('ventas').getList(1, 1, {
          filter: `cliente = "${cliente.id}" && estatus != "cancelado"`,
          sort: '-fecha',
          $autoCancel: false
        });

        let lastPurchaseDate = null;
        let daysSince = 0;

        if (ventas.items.length > 0) {
          lastPurchaseDate = new Date(ventas.items[0].fecha);
          const diffTime = Math.abs(today - lastPurchaseDate);
          daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } else {
          // If no sales, consider created date or a default high number
          lastPurchaseDate = new Date(cliente.created);
          const diffTime = Math.abs(today - lastPurchaseDate);
          daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        if (daysSince >= daysInactive) {
          inactiveClients.push({
            cliente,
            lastPurchaseDate,
            daysSince
          });
        }
      }

      return { success: true, data: inactiveClients };
    } catch (error) {
      console.error('Error getting inactive clients:', error);
      return { success: false, error };
    }
  }, []);

  const createAutoReminders = useCallback(async (userId, daysInactive = 30) => {
    try {
      const { success, data: inactiveClients } = await getInactiveClients(daysInactive);
      if (!success) throw new Error('Failed to fetch inactive clients');

      let createdCount = 0;
      const today = new Date();
      const nextReminder = new Date(today);
      nextReminder.setDate(today.getDate() + 1); // Remind tomorrow

      for (const item of inactiveClients) {
        // Check if a pending reminder already exists
        const existing = await pb.collection('recordatorios_clientes').getList(1, 1, {
          filter: `cliente = "${item.cliente.id}" && estatus = "pendiente"`,
          $autoCancel: false
        });

        if (existing.items.length === 0) {
          const recordatorio = await pb.collection('recordatorios_clientes').create({
            cliente: item.cliente.id,
            fecha_ultima_compra: item.lastPurchaseDate.toISOString(),
            dias_sin_comprar: item.daysSince,
            fecha_proximo_recordatorio: nextReminder.toISOString(),
            estatus: 'pendiente',
            creado_por: userId,
            notas: 'Generado automáticamente por inactividad.'
          }, { $autoCancel: false });

          await createNotification(
            'recordatorio',
            `Recordatorio automático creado para ${item.cliente.nombre_completo || item.cliente.nombre} (${item.daysSince} días sin comprar)`,
            userId,
            null,
            recordatorio.id
          );

          createdCount++;
        }
      }

      return { success: true, count: createdCount };
    } catch (error) {
      console.error('Error creating auto reminders:', error);
      return { success: false, error };
    }
  }, [getInactiveClients, createNotification]);

  const getClientReminders = useCallback(async (clientId) => {
    try {
      const records = await pb.collection('recordatorios_clientes').getFullList({
        filter: `cliente = "${clientId}"`,
        sort: '-created',
        expand: 'creado_por',
        $autoCancel: false
      });
      return { success: true, data: records };
    } catch (error) {
      console.error('Error getting client reminders:', error);
      return { success: false, error };
    }
  }, []);

  return {
    getInactiveClients,
    createAutoReminders,
    getClientReminders
  };
};