import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ProveedoresForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    codigo_proveedor: '',
    razon_social: '',
    direccion: '',
    telefono: '',
    email: '',
    observaciones: '',
    estado: 'Activo'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        codigo_proveedor: initialData.codigo_proveedor || '',
        razon_social: initialData.razon_social || '',
        direccion: initialData.direccion || '',
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        observaciones: initialData.observaciones || '',
        estado: initialData.estado || 'Activo'
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.codigo_proveedor) newErrors.codigo_proveedor = 'El código es requerido';
    if (!formData.razon_social.trim()) newErrors.razon_social = 'La razón social es requerida';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Card className="border shadow-sm rounded-2xl overflow-hidden bg-card">
      <CardHeader className="bg-muted/10 border-b pb-4">
        <CardTitle className="text-xl">Datos del Proveedor</CardTitle>
        <CardDescription>Completa la información requerida. Los campos marcados con * son obligatorios.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="codigo_proveedor" className="text-foreground font-medium">Código de Proveedor <span className="text-destructive">*</span></Label>
              <Input 
                id="codigo_proveedor"
                name="codigo_proveedor" 
                value={formData.codigo_proveedor} 
                disabled 
                readOnly
                className="bg-muted/50 text-muted-foreground font-mono cursor-not-allowed"
                title="Este código es autogenerado por el sistema"
              />
              {errors.codigo_proveedor && <p className="text-sm text-destructive mt-1">{errors.codigo_proveedor}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium">Estado <span className="text-destructive">*</span></Label>
              <Select value={formData.estado} onValueChange={(val) => handleSelectChange('estado', val)} disabled={isLoading}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="razon_social" className="text-foreground font-medium">Razón Social <span className="text-destructive">*</span></Label>
              <Input 
                id="razon_social"
                name="razon_social" 
                value={formData.razon_social} 
                onChange={handleChange} 
                disabled={isLoading}
                className={`h-11 bg-background text-foreground ${errors.razon_social ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                placeholder="Ej. PEMEX S.A. de C.V."
              />
              {errors.razon_social && <p className="text-sm text-destructive mt-1">{errors.razon_social}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Correo Electrónico <span className="text-destructive">*</span></Label>
              <Input 
                id="email"
                type="email"
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                disabled={isLoading}
                className={`h-11 bg-background text-foreground ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                placeholder="contacto@proveedor.com"
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-foreground font-medium">Teléfono <span className="text-destructive">*</span></Label>
              <Input 
                id="telefono"
                type="tel"
                name="telefono" 
                value={formData.telefono} 
                onChange={handleChange} 
                disabled={isLoading}
                className={`h-11 bg-background text-foreground ${errors.telefono ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                placeholder="Ej. 555-123-4567"
              />
              {errors.telefono && <p className="text-sm text-destructive mt-1">{errors.telefono}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion" className="text-foreground font-medium">Dirección Fiscal <span className="text-destructive">*</span></Label>
              <Input 
                id="direccion"
                name="direccion" 
                value={formData.direccion} 
                onChange={handleChange} 
                disabled={isLoading}
                className={`h-11 bg-background text-foreground ${errors.direccion ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                placeholder="Calle, Número, Colonia, Ciudad, Estado, CP"
              />
              {errors.direccion && <p className="text-sm text-destructive mt-1">{errors.direccion}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-foreground font-medium">Observaciones</Label>
            <Textarea 
              id="observaciones"
              name="observaciones" 
              value={formData.observaciones} 
              onChange={handleChange} 
              disabled={isLoading}
              className="min-h-[120px] bg-background text-foreground resize-y" 
              placeholder="Detalles adicionales sobre este proveedor..."
            />
          </div>

          <div className="pt-6 border-t flex justify-end gap-4">
            <Button type="submit" disabled={isLoading} className="h-11 px-8">
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4 mr-2" /> Guardar Proveedor</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProveedoresForm;