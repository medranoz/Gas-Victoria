import { useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';

export const useNotificationSystem = () => {
  const createNotification = async (tipo, mensaje, usuario_destino, venta_relacionada = null, recordatorio_relacionado = null) => {
    try {
      const data = {
        tipo,
        mensaje,
        usuario_destino,
        leida: false,
      };
      if (venta_relacionada) data.venta_relacionada = venta_relacionada;
      if (recordatorio_relacionado) data.recordatorio_relacionado = recordatorio_relacionado;

      const record = await pb.collection('notificaciones').create(data, { $autoCancel: false });
      return { success: true, data: record };
    } catch (error) {
      console.error('[useNotificationSystem] Error creating notification:', error);
      return { success: false, error };
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const record = await pb.collection('notificaciones').update(notificationId, { leida: true }, { $autoCancel: false });
      return { success: true, data: record };
    } catch (error) {
      console.error('[useNotificationSystem] Error marking notification as read:', error);
      return { success: false, error };
    }
  };

  const markAllAsRead = async (userId) => {
    try {
      const unread = await pb.collection('notificaciones').getFullList({
        filter: `usuario_destino = "${userId}" && leida = false`,
        $autoCancel: false
      });
      
      const promises = unread.map(n => 
        pb.collection('notificaciones').update(n.id, { leida: true }, { $autoCancel: false })
      );
      
      await Promise.all(promises);
      return { success: true, count: unread.length };
    } catch (error) {
      console.error('[useNotificationSystem] Error marking all notifications as read:', error);
      return { success: false, error };
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await pb.collection('notificaciones').delete(notificationId, { $autoCancel: false });
      return { success: true };
    } catch (error) {
      console.error('[useNotificationSystem] Error deleting notification:', error);
      return { success: false, error };
    }
  };

  const getUnreadCount = useCallback(async (userId) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const result = await pb.collection('notificaciones').getList(1, 1, {
        filter: `usuario_destino = "${userId}" && leida = false`,
        $autoCancel: false,
        signal: controller.signal
      });
      return { success: true, count: result.totalItems };
    } catch (error) {
      if (error.name !== 'AbortError' && !error.isAbort) {
        console.error('[useNotificationSystem] Error getting unread count:', error);
      }
      return { success: false, error, count: 0 };
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  return {
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
  };
};