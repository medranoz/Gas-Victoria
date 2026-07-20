import pb from '@/lib/pocketbaseClient.js';

export const checkMaintenanceNotifications = async (userId) => {
  if (!userId) return;
  
  try {
    // Buscar ATQs con mantenimiento programado y notificaciones activas
    const atqs = await pb.collection('atqs').getFullList({
      filter: `notificacion_mantenimiento = true && activo = true && fecha_mantenimiento != ""`,
      $autoCancel: false
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    for (const atq of atqs) {
      // PocketBase dates are UTC, we parse them and strip time for local comparison
      const maintDateStr = atq.fecha_mantenimiento.split('T')[0];
      const maintDate = new Date(maintDateStr + 'T00:00:00'); // Force local midnight
      
      // Si la fecha de mantenimiento está dentro de los próximos 7 días (o es hoy)
      if (maintDate >= today && maintDate <= sevenDaysFromNow) {
        // Calcular días faltantes para un mensaje más amigable
        const diffTime = Math.abs(maintDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let timeText = diffDays === 0 ? 'hoy' : diffDays === 1 ? 'mañana' : `en ${diffDays} días`;
        const msgText = `Mantenimiento próximo para ATQ ${atq.atq_id} (Placa: ${atq.placa}). Programado para ${timeText} (${maintDate.toLocaleDateString()}).`;
        
        // Verificar si ya existe una notificación reciente (últimas 24h) para evitar spam
        const twentyFourHoursAgo = new Date(Date.now() - 86400000).toISOString();
        const existing = await pb.collection('notificaciones').getList(1, 1, {
          filter: `usuario_destino = "${userId}" && mensaje ~ "ATQ ${atq.atq_id}" && created >= "${twentyFourHoursAgo}"`,
          $autoCancel: false
        });

        if (existing.totalItems === 0) {
          await pb.collection('notificaciones').create({
            tipo: 'sistema',
            mensaje: msgText,
            usuario_destino: userId,
            leida: false
          }, { $autoCancel: false });
        }
      }
    }
  } catch (error) {
    console.error('Error verificando notificaciones de mantenimiento ATQ:', error);
  }
};