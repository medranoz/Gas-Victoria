import { useCallback } from 'react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const usePDFExport = () => {
  
  const generateCutPDF = useCallback((cutData) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text('GAS VICTORIA', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Comprobante de Corte DRV`, 14, 30);
      doc.text(`Fecha de Generación: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 14, 35);
      
      // Separator
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 40, 196, 40);
      
      // Details Table
      doc.autoTable({
        startY: 45,
        theme: 'plain',
        head: [['Información del Dispositivo', 'Valores de Corte']],
        body: [
          [`DRV ID: ${cutData.drv_id}`, `Valor Inicial (VI): ${cutData.vi?.toFixed(4)} L`],
          [`Marca/Modelo: ${cutData.marca} ${cutData.modelo}`, `Valor Final (VF): ${cutData.vf?.toFixed(4)} L`],
          [`Operador: ${cutData.usuario}`, `Volumen de Corte: ${cutData.corte?.toFixed(4)} L`]
        ],
        headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' },
        styles: { cellPadding: 4, fontSize: 10 }
      });
      
      let finalY = doc.lastAutoTable.finalY + 10;
      
      if (cutData.observaciones) {
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.setFont(undefined, 'bold');
        doc.text('Observaciones:', 14, finalY);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text(cutData.observaciones, 14, finalY + 6, { maxWidth: 180 });
      }

      doc.save(`Corte_DRV_${cutData.drv_id}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
      toast.success('PDF generado exitosamente');
      return true;
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Error al generar el PDF');
      return false;
    }
  }, []);

  const generateHistoryPDF = useCallback((historyData, filters) => {
    try {
      const doc = new jsPDF('landscape');
      
      doc.setFontSize(16);
      doc.text('Historial de Cortes DRV - Gas Victoria', 14, 15);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 14, 22);
      
      const tableData = historyData.map(item => [
        format(new Date(item.fecha_hora_vf), 'dd/MM/yyyy HH:mm'),
        item.expand?.drv_id?.drv_id || item.drv_id,
        item.vi?.toFixed(2),
        item.vf?.toFixed(2),
        item.corte?.toFixed(2),
        item.expand?.usuario?.email || 'N/A'
      ]);

      doc.autoTable({
        startY: 30,
        head: [['Fecha/Hora', 'DRV', 'VI (L)', 'VF (L)', 'Corte (L)', 'Operador']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] }
      });

      doc.save(`Historial_Cortes_DRV_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success('PDF exportado exitosamente');
    } catch (err) {
      console.error('History PDF error:', err);
      toast.error('Error al generar PDF de historial');
    }
  }, []);

  return { generateCutPDF, generateHistoryPDF };
};