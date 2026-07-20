import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

const DRVForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    drv_id: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    estado: 'activo',
    fecha_calibracion: '',
    vi_actual: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        drv_id: initialData.drv_id || '',
        marca: initialData.marca || '',
        modelo: initialData.modelo || '',
        numero_serie: initialData.numero_serie || '',
        estado: initialData.estado ? initialData.estado.toLowerCase() : 'activo',
        fecha_calibracion: initialData.fecha_calibracion ? initialData.fecha_calibracion.split('T')[0] : '',
        vi_actual: initialData.vi_actual !== undefined ? initialData.vi_actual : 0
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, vi_actual: Number(formData.vi_actual) };
    if (!payload.fecha_calibracion) delete payload.fecha_calibracion;
    onSubmit(payload);
  };

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-2xl font-bold">
          {initialData?.id ? 'Editar Dispositivo DRV' : 'Registrar Nuevo DRV'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>DRV ID</Label>
              <Input value={formData.drv_id} disabled className="bg-muted font-mono" placeholder="Autogenerado" />
            </div>
            
            <div className="space-y-2">
              <Label>Valor Inicial (VI) *</Label>
              <Input 
                type="number" 
                name="vi_actual" 
                value={formData.vi_actual} 
                onChange={handleChange} 
                min="0" 
                step="0.0001"
                required
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Puede ser 0 o cualquier valor positivo.</p>
            </div>

            <div className="space-y-2">
              <Label>Marca *</Label>
              <Input name="marca" value={formData.marca} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Modelo *</Label>
              <Input name="modelo" value={formData.modelo} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Número de Serie</Label>
              <Input name="numero_serie" value={formData.numero_serie} onChange={handleChange} className="font-mono" />
            </div>

            <div className="space-y-2">
              <Label>Estado *</Label>
              <Select value={formData.estado} onValueChange={(val) => handleSelectChange('estado', val)}>
                <SelectTrigger><SelectValue placeholder="Seleccione estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Última Calibración</Label>
              <Input type="date" name="fecha_calibracion" value={formData.fecha_calibracion} onChange={handleChange} />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? 'Guardando...' : (initialData?.id ? 'Actualizar DRV' : 'Crear DRV')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DRVForm;