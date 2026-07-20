import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Fuel } from 'lucide-react';

const DRVSelector = ({ drvList, selectedId, onSelect, disabled = false }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground">Seleccionar DRV</label>
      <Select value={selectedId} onValueChange={onSelect} disabled={disabled}>
        <SelectTrigger className="w-full bg-card h-12 text-base">
          <SelectValue placeholder="Elige un Dispositivo de Registro Volumétrico..." />
        </SelectTrigger>
        <SelectContent>
          {drvList.length === 0 ? (
            <SelectItem value="none" disabled>No hay DRVs disponibles</SelectItem>
          ) : (
            drvList.map((drv) => (
              <SelectItem key={drv.id} value={drv.id}>
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-md">
                    <Fuel className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-medium">{drv.marca} - {drv.modelo}</span>
                    <span className="text-xs text-muted-foreground">VI Actual: {drv.vi_actual?.toLocaleString()} L</span>
                  </div>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DRVSelector;