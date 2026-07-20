import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Calculator, Eye } from 'lucide-react';
import { useCalculateCut } from '@/hooks/useCalculateCut.js';
import pb from '@/lib/pocketbaseClient.js';

const CutForm = ({ selectedDRV, onPreview }) => {
  const [vf, setVf] = useState('');
  const [validation, setValidation] = useState({ valid: false, error: '' });
  const { validateCut } = useCalculateCut();

  const viActual = selectedDRV ? selectedDRV.vi_actual : 0;

  useEffect(() => {
    if (vf && selectedDRV) {
      const res = validateCut(viActual, vf);
      setValidation(res);
    } else {
      setValidation({ valid: false, error: '' });
    }
  }, [vf, viActual, selectedDRV]);

  const handlePreview = (e) => {
    e.preventDefault();
    if (!selectedDRV || !validation.valid) return;
    
    onPreview({
      drv_id: selectedDRV.drv_id,
      drvid_real: selectedDRV.id,
      marca: selectedDRV.marca,
      modelo: selectedDRV.modelo,
      vi: viActual,
      vf: parseFloat(vf),
      corte: validation.corte,
      usuario: pb.authStore.model?.email || 'Operador',
      usuario_id: pb.authStore.model?.id
    });
  };

  if (!selectedDRV) {
    return (
      <div className="p-8 text-center bg-muted/30 rounded-2xl border border-dashed border-border/60">
        <Calculator className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground text-sm">Selecciona un DRV arriba para iniciar el registro del corte.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePreview} className="space-y-8 bg-card p-6 md:p-8 rounded-2xl shadow-lg border border-border/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-muted-foreground">Valor Inicial (VI)</label>
          <div className="relative">
            <Input type="text" value={viActual.toLocaleString(undefined, {minimumFractionDigits:4})} readOnly className="h-14 text-lg bg-muted text-muted-foreground font-mono" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">LITROS</div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Valor Final (VF)</label>
          <div className="relative">
            <Input 
              type="number" step="0.0001" value={vf} onChange={(e) => setVf(e.target.value)}
              placeholder="Ej: 15420.5000" required
              className={`h-14 text-lg font-mono focus-visible:ring-primary ${validation.error ? 'border-destructive' : ''}`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">LITROS</div>
          </div>
          {validation.error && <p className="text-xs text-destructive font-medium">{validation.error}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" size="lg" disabled={!validation.valid} className="h-14 px-8 shadow-md">
          <Eye className="w-5 h-5 mr-2" /> VISTA PREVIA
        </Button>
      </div>
    </form>
  );
};

export default CutForm;