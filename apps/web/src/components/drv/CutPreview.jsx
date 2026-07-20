import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ArrowLeft, CheckCircle2, Download } from 'lucide-react';
import { usePDFExport } from '@/hooks/usePDFExport.js';

const CutPreview = ({ previewData, onConfirm, onCancel, isLoading }) => {
  const { generateCutPDF } = usePDFExport();

  if (!previewData) return null;

  return (
    <Card className="shadow-lg border-border/50 border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-4">
      <CardHeader className="bg-muted/10 border-b pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <CheckCircle2 className="text-primary w-5 h-5" /> Confirmación de Corte
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-1">Dispositivo</p>
            <p className="font-bold text-foreground">{previewData.drv_id} ({previewData.marca} {previewData.modelo})</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-1">Operador</p>
            <p className="font-bold text-foreground">{previewData.usuario}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-5 bg-card border rounded-xl shadow-sm">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Valor Inicial (VI)</span>
            <span className="font-mono font-medium">{previewData.vi?.toFixed(4)} L</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Valor Final (VF)</span>
            <span className="font-mono font-medium">{previewData.vf?.toFixed(4)} L</span>
          </div>
          <div className="border-t my-2 border-dashed"></div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-primary">Volumen Calculado</span>
            <span className="font-mono text-xl font-bold text-primary">{previewData.corte?.toFixed(4)} L</span>
          </div>
        </div>

        <div className="p-3 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium flex items-start gap-2">
          <span>ℹ️</span>
          <p>Después de aplicar este corte, el próximo VI del dispositivo se actualizará automáticamente a <strong>{previewData.vf?.toFixed(4)} L</strong>.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" /> Editar Valores
          </Button>
          <Button variant="secondary" onClick={() => generateCutPDF(previewData)} className="flex-1">
            <Download className="w-4 h-4 mr-2" /> Descargar PDF
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="flex-1 bg-primary">
            {isLoading ? 'Guardando...' : 'Confirmar y Aplicar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CutPreview;