import pb from '@/lib/pocketbaseClient.js';

export const generateDRVId = async () => {
  try {
    const records = await pb.collection('drv').getFullList({ sort: '-drv_id', $autoCancel: false });
    if (records.length === 0) return 'DRV-0001';
    
    // Extract numbers, find max
    const numbers = records.map(r => {
      const match = r.drv_id?.match(/DRV-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }).filter(n => !isNaN(n));
    
    const max = Math.max(...numbers, 0);
    return `DRV-${String(max + 1).padStart(4, '0')}`;
  } catch (err) {
    console.error('Error generating DRV ID:', err);
    return 'DRV-0001';
  }
};

export const updateNextCycleVI = (vf, capture_date, user_id) => {
  return {
    vi_actual: parseFloat(vf),
    fecha_vi: capture_date,
    usuario_creacion: user_id
  };
};

export const logAuditEvent = async (accion, entidad, entidad_id, usuario_id, detalles) => {
  try {
    await pb.collection('drv_audit_log').create({
      accion: accion, // 'create' | 'update' | 'cut' | 'upload' | 'export' | 'delete'
      drv_id: entidad === 'drv' ? entidad_id : null,
      reading_id: entidad === 'reading' ? entidad_id : null,
      usuario: usuario_id,
      fecha_hora: new Date().toISOString(),
      detalles: JSON.stringify(detalles)
    }, { $autoCancel: false });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};