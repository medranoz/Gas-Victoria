import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export const useControlRecepcionReports = () => {
  const [loading, setLoading] = useState(false);

  const generateReport = useCallback(async (filters) => {
    setLoading(true);
    try {
      let filterQuery = [];
      if (filters.estacion_id && filters.estacion_id !== 'all') filterQuery.push(`estacion_id = "${filters.estacion_id}"`);
      if (filters.proveedor_id && filters.proveedor_id !== 'all') filterQuery.push(`proveedor_id = "${filters.proveedor_id}"`);
      if (filters.estado_registro && filters.estado_registro !== 'all') filterQuery.push(`estado_registro = "${filters.estado_registro}"`);
      if (filters.startDate) filterQuery.push(`fecha_hora >= "${filters.startDate} 00:00:00"`);
      if (filters.endDate) filterQuery.push(`fecha_hora <= "${filters.endDate} 23:59:59"`);

      const records = await pb.collection('control_recepcion').getFullList({
        filter: filterQuery.join(' && '),
        sort: '-fecha_hora',
        expand: 'estacion_id,proveedor_id,usuario_id',
        $autoCancel: false
      });
      return { success: true, data: records };
    } catch (err) {
      console.error('Report error:', err);
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
        if (columns.includes('folio')) row['Folio'] = item.folio;
        if (columns.includes('fecha')) {
          const date = new Date(item.fecha_hora);
          row['Fecha'] = date.toLocaleDateString();
          row['Hora'] = date.toLocaleTimeString();
        }
        if (columns.includes('estacion')) row['Estación'] = item.expand?.estacion_id?.nombre || 'N/A';
        if (columns.includes('proveedor')) row['Proveedor'] = item.expand?.proveedor_id?.razon_social || 'N/A';
        if (columns.includes('usuario')) row['Usuario'] = item.expand?.usuario_id?.name || item.expand?.usuario_id?.email || 'N/A';
        if (columns.includes('li_tara')) row['LI Tara'] = item.li_tara;
        if (columns.includes('lf_tara')) row['LF Tara'] = item.lf_tara;
        if (columns.includes('dif_tara')) row['Dif. Tara'] = item.dif_tara;
        if (columns.includes('li_presion')) row['LI Presión'] = item.li_presion;
        if (columns.includes('lf_presion')) row['LF Presión'] = item.lf_presion;
        if (columns.includes('dif_presion')) row['Dif. Presión'] = item.dif_presion;
        
        // New Columns mapped with DRV and MAGNETEL labels
        if (columns.includes('capacidad_total_ct')) row['CT (Lts)'] = item.capacidad_total_ct;
        if (columns.includes('capacidad_permitida_cp')) row['CP (Lts)'] = item.capacidad_permitida_cp;
        if (columns.includes('litraje_inicial_lti')) row['DRV (LTi) (Lts)'] = item.litraje_inicial_lti;
        if (columns.includes('litraje_final_ltf')) row['DRV (LTf) (Lts)'] = item.litraje_final_ltf;
        if (columns.includes('diferencia_litraje_diflt')) row['Diferencia DRV (DifLT) (Lts)'] = item.diferencia_litraje_diflt;
        if (columns.includes('capacidad_disponible_inicial_cdi')) row['MAGNETEL (CDi) (%)'] = item.capacidad_disponible_inicial_cdi;
        if (columns.includes('capacidad_disponible_final_cdf')) row['MAGNETEL (CDf) (%)'] = item.capacidad_disponible_final_cdf;
        if (columns.includes('diferencia_capacidad_difcd')) row['Diferencia Magnetel (DifCD) (%)'] = item.diferencia_capacidad_difcd;

        if (columns.includes('estado')) row['Estado'] = item.estado_registro;
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Recepciones');
      XLSX.writeFile(workbook, `reporte_recepcion_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Reporte exportado a CSV');
      console.log('AUDIT LOG: Reporte CSV exportado');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Error al exportar reporte');
    }
  }, []);

  return { loading, generateReport, exportToCSV };
};