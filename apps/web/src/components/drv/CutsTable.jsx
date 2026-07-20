import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { format } from 'date-fns';
import { FileWarning, FileText, Trash2 } from 'lucide-react';
import { usePDFExport } from '@/hooks/usePDFExport.js';

const CutsTable = ({ cuts, isLoading, onDelete }) => {
  const { generateCutPDF } = usePDFExport();

  if (isLoading) {
    return (
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Fecha / Hora</TableHead>
              <TableHead>DRV</TableHead>
              <TableHead className="text-right">VI</TableHead>
              <TableHead className="text-right">VF</TableHead>
              <TableHead className="text-right">Corte</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!cuts || cuts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-card border border-border border-dashed rounded-xl">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4"><FileWarning className="w-8 h-8 text-muted-foreground" /></div>
        <h3 className="text-lg font-medium text-foreground mb-1">No se encontraron cortes</h3>
        <p className="text-sm text-muted-foreground text-center">Ajusta los filtros para ver el historial.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Fecha y Hora</TableHead>
            <TableHead>Dispositivo</TableHead>
            <TableHead className="text-right">VI (L)</TableHead>
            <TableHead className="text-right">VF (L)</TableHead>
            <TableHead className="text-right font-bold text-primary">Corte (L)</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cuts.map((cut) => {
            const drv = cut.expand?.drv_id;
            const user = cut.expand?.usuario;
            const pdfData = {
              drv_id: drv?.drv_id || cut.drv_id,
              marca: drv?.marca || '',
              modelo: drv?.modelo || '',
              vi: cut.vi, vf: cut.vf, corte: cut.corte,
              usuario: user?.email || 'N/A'
            };
            return (
              <TableRow key={cut.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="font-medium">{format(new Date(cut.fecha_hora_vf), 'dd/MM/yyyy')}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(cut.fecha_hora_vf), 'HH:mm:ss')}</div>
                </TableCell>
                <TableCell className="font-medium">
                  {drv?.drv_id} <span className="text-xs text-muted-foreground block">{drv?.marca}</span>
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">{cut.vi?.toFixed(4)}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">{cut.vf?.toFixed(4)}</TableCell>
                <TableCell className="text-right font-mono font-bold text-primary bg-primary/5">{cut.corte?.toFixed(4)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{user?.email?.split('@')[0]}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => generateCutPDF(pdfData)} className="hover:text-primary">
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete && onDelete(cut.id)} className="hover:text-destructive text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CutsTable;