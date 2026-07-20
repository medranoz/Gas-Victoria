import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const ProviderForm = ({ isOpen, onClose, provider, onSuccess }) => {
  const [formData, setFormData] = useState({
    razon_social: '',
    direccion: '',
    telefono: '',
    email: '',
    observaciones: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (provider) {
      setFormData({
        razon_social: provider.razon_social || '',
        direccion: provider.direccion || '',
        telefono: provider.telefono || '',
        email: provider.email || '',
        observaciones: provider.observaciones || ''
      });
    } else {
      setFormData({
        razon_social: '',
        direccion: '',
        telefono: '',
        email: '',
        observaciones: ''
      });
    }
  }, [provider, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.razon_social.trim()) {
      toast.error('La razón social es obligatoria');
      return;
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('El formato del email no es válido');
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        razon_social: formData.razon_social.trim(),
        direccion: formData.direccion.trim() || '',
        telefono: formData.telefono.trim() || '',
        email: formData.email.trim() || '',
        observaciones: formData.observaciones.trim() || ''
      };

      if (provider) {
        await pb.collection('proveedores').update(provider.id, dataToSubmit, { $autoCancel: false });
        toast.success('Proveedor actualizado correctamente');
      } else {
        await pb.collection('proveedores').create(dataToSubmit, { $autoCancel: false });
        toast.success('Proveedor creado correctamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving provider:', error);
      toast.error(provider ? 'Error al actualizar el proveedor' : 'Error al crear el proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {provider ? 'Editar proveedor' : 'Nuevo proveedor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="razon_social" className="text-sm font-medium">
              Razón social <span className="text-destructive">*</span>
            </Label>
            <Input
              id="razon_social"
              name="razon_social"
              value={formData.razon_social}
              onChange={handleChange}
              placeholder="Nombre de la empresa"
              required
              className="text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion" className="text-sm font-medium">
              Dirección
            </Label>
            <Input
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Dirección completa"
              className="text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-sm font-medium">
                Teléfono
              </Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Número de contacto"
                className="text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className="text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-medium">
              Observaciones
            </Label>
            <Textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales sobre el proveedor"
              rows={4}
              className="text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? 'Guardando...' : provider ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderForm;