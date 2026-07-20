import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

const EditTankModal = ({ isOpen, onClose, onSuccess, tank }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', capacidad: '', carga_inicial: '', fecha_carga_inicial: '', origen_carga: ''
  });

  useEffect(() => {
    if (tank) {
      setFormData({
        nombre: tank.nombre || '',
        capacidad: tank.capacidad || '',
        carga_inicial: tank.carga_inicial || '',
        fecha_carga_inicial: tank.fecha_carga_inicial ? tank.fecha_carga_inicial.split(' ')[0] : '',
        origen_carga: tank.origen_carga || ''
      });
    }
  }, [tank]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const capacidad = parseFloat(formData.capacidad);
    const carga_inicial = parseFloat(formData.carga_inicial);

    if (carga_inicial <= 0) {
      toast.error('La carga inicial debe ser mayor a 0');
      return;
    }
    if (carga_inicial > capacidad) {
      toast.error('La carga inicial no puede ser mayor a la capacidad');
      return;
    }

    setSubmitting(true);
    try {
      await pb.collection('tanques').update(tank.id, {
        nombre: formData.nombre,
        capacidad: capacidad,
        carga_inicial: carga_inicial,
        fecha_carga_inicial: formData.fecha_carga_inicial,
        origen_carga: formData.origen_carga
      }, { $autoCancel: false });
      
      toast.success('Tanque actualizado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el tanque');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Tanque</DialogTitle>
          <DialogDescription>Modifica los detalles del tanque seleccionado.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nombre / Identificador *</Label>
            <Input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Capacidad (L/KG) *</Label>
              <Input type="number" step="0.01" required min="0.1" value={formData.capacidad} onChange={e => setFormData({...formData, capacidad: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Carga Inicial *</Label>
              <Input type="number" step="0.01" required min="0.1" value={formData.carga_inicial} onChange={e => setFormData({...formData, carga_inicial: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Carga *</Label>
              <Input type="date" required value={formData.fecha_carga_inicial} onChange={e => setFormData({...formData, fecha_carga_inicial: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Origen de Carga</Label>
              <Input value={formData.origen_carga} onChange={e => setFormData({...formData, origen_carga: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar Cambios'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTankModal;