import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export const useDRVReports = () => {
  const [loading, setLoading] = useState(false);

  const generateReport = useCallback(async (filters) => {
    setLoading(true);
    try {
      let filterQuery = [];
      if (filters.drv_id) filterQuery.push(`drv_id = "${filters.drv_id}"`);
      if (filters.estado_registro) filterQuery.push(`estado_registro = "${filters.estado_registro}"`);
      if (filters.startDate) filterQuery.push(`fecha_captura >= "${filters.startDate}"`);
      if (filters.endDate) filterQuery.push(`fecha_captura <= "${filters.endDate}"`);

      const records = await pb.collection('drv_registros').getFullList({
        filter: filterQuery.join(' && '),
        sort: '-fecha_captura,-hora_captura',
        expand: 'drv_id,usuario_responsable',
        $autoCancel: false
      });
      return { success: true, data: records };
    } catch (err) {
      toast.error('Error al generar reporte');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToCSV = useCallback((data, columns) => {
    try {
      const exportData = data.map(item => {
        let row = {};
        if (columns.includes('registro_id')) row['Registro ID'] = item.registro_id;
        if (columns.includes('drv_id')) row['DRV ID'] = item.expand?.drv_id?.drv_id || 'N/A';
        if (columns.includes('fecha')) row['Fecha'] = item.fecha_captura;
        if (columns.includes('hora')) row['Hora'] = item.hora_captura;
        if (columns.includes('valor_inicial')) row['Valor Inicial'] = item.valor_inicial;
        if (columns.includes('valor_final')) row['Valor Final'] = item.valor_final;
        if (columns.includes('corte')) row['Corte'] = item.corte;
        if (columns.includes('estado')) row['Estado'] = item.estado_registro;
        if (columns.includes('usuario')) row['Usuario'] = item.expand?.usuario_responsable?.name || item.expand?.usuario_responsable?.email;
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte DRV');
      XLSX.writeFile(workbook, `reporte_drv_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Reporte exportado a CSV');
    } catch (err) {
      toast.error('Error al exportar reporte');
    }
  }, []);

  return { loading, generateReport, exportToCSV };
};