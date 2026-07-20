import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const ExportModal = ({ isOpen, onClose, data }) => {
  const [cols, setCols] = useState({
    id_corte: true,
    drv_info: true,
    fechas: true,
    volumenes: true,
    usuario: true
  });

  const handleExport = () => {
    if (!data || data.length === 0) return;

    const exportData = data.map(item => {
      const row = {};
      
      if (cols.id_corte) row['ID Corte'] = item.id;
      if (cols.drv_info) {
        row['ID DRV'] = item.expand?.drv_id?.id || item.drv_id;
        row['Marca DRV'] = item.expand?.drv_id?.marca || '-';
        row['Modelo DRV'] = item.expand?.drv_id?.modelo || '-';
      }
      if (cols.fechas) {
        row['Fecha Corte'] = format(new Date(item.fecha_hora_vf), 'yyyy-MM-dd HH:mm:ss');
      }
      if (cols.volumenes) {
        row['VI (Valor Inicial)'] = item.vi;
        row['VF (Valor Final)'] = item.vf;
        row['Volumen Corte'] = item.corte;
      }
      if (cols.usuario) {
        row['Operador'] = item.expand?.usuario?.email || '-';
      }
      
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial_Cortes");
    
    const fileName = `Exportacion_Cortes_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Historial</DialogTitle>
          <DialogDescription>
            Selecciona la información que deseas incluir en el archivo Excel (.xlsx). Se exportarán los registros actualmente visibles en la tabla.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="id_corte" checked={cols.id_corte} onCheckedChange={(c) => setCols(p => ({...p, id_corte: c}))} />
            <Label htmlFor="id_corte">ID del Registro de Corte</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="drv_info" checked={cols.drv_info} onCheckedChange={(c) => setCols(p => ({...p, drv_info: c}))} />
            <Label htmlFor="drv_info">Información del DRV (Marca, Modelo)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="fechas" checked={cols.fechas} onCheckedChange={(c) => setCols(p => ({...p, fechas: c}))} />
            <Label htmlFor="fechas">Fechas y Horas</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="volumenes" checked={cols.volumenes} onCheckedChange={(c) => setCols(p => ({...p, volumenes: c}))} />
            <Label htmlFor="volumenes">Volúmenes (VI, VF, Total Corte)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="usuario" checked={cols.usuario} onCheckedChange={(c) => setCols(p => ({...p, usuario: c}))} />
            <Label htmlFor="usuario">Usuario / Operador</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleExport} disabled={!data || data.length === 0}>
            Generar Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;