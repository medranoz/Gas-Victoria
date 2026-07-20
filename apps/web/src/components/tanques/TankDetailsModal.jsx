import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import ProgressBar from '@/components/ProgressBar.jsx';
import { useCalculateTankAvailability } from '@/hooks/useCalculateTankAvailability.js';
import { Skeleton } from '@/components/ui/skeleton.jsx';

const TankDetailsModal = ({ isOpen, onClose, tank }) => {
  const { carga_disponible, porcentaje_disponible, total_vendido, estado, loading } = useCalculateTankAvailability(tank?.id);

  if (!tank) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{tank.nombre}</DialogTitle>
          <DialogDescription>Detalles completos y estado actual del tanque.</DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estado Actual</h4>
              <ProgressBar 
                percentage={porcentaje_disponible} 
                estado={estado} 
                label={`${carga_disponible.toLocaleString()} / ${tank.capacidad.toLocaleString()} disponibles`} 
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Capacidad Total</p>
                <p className="font-semibold text-lg">{tank.capacidad?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Vendido</p>
                <p className="font-semibold text-lg">{total_vendido?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Carga Inicial</p>
                <p className="font-medium">{tank.carga_inicial?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Carga</p>
                <p className="font-medium">{tank.fecha_carga_inicial ? new Date(tank.fecha_carga_inicial).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Origen de Carga</p>
                <p className="font-medium">{tank.origen_carga || 'No especificado'}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TankDetailsModal;