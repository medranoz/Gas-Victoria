import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';

const NotificationConfigModal = ({ isOpen, onClose, onSuccess, tank }) => {
  const [submitting, setSubmitting] = useState(false);
  const [activa, setActiva] = useState(false);
  const [porcentaje, setPorcentaje] = useState(20);

  useEffect(() => {
    if (tank) {
      setActiva(tank.notificacion_activa || false);
      setPorcentaje(tank.porcentaje_notificacion || 20);
    }
  }, [tank]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await pb.collection('tanques').update(tank.id, {
        notificacion_activa: activa,
        porcentaje_notificacion: parseFloat(porcentaje),
        ultima_notificacion: new Date().toISOString()
      }, { $autoCancel: false });
      
      toast.success('Configuración de notificaciones actualizada');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar configuración');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Notificaciones</DialogTitle>
          <DialogDescription>Recibe alertas cuando el nivel del tanque baje del límite establecido.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Activar Alertas</Label>
              <p className="text-sm text-muted-foreground">Habilitar notificaciones para este tanque</p>
            </div>
            <Switch checked={activa} onCheckedChange={setActiva} />
          </div>
          
          {activa && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <Label>Notificar cuando la carga disponible sea menor a:</Label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="100" 
                  value={porcentaje} 
                  onChange={e => setPorcentaje(e.target.value)} 
                  className="w-24"
                />
                <span className="text-muted-foreground font-medium">%</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar Configuración'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationConfigModal;