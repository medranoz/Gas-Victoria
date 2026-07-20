import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

const DRVReadingsForm = ({ initialData, drvId, initialValue, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    drv_id: drvId || '',
    valor_inicial: initialValue || 0,
    valor_final: '',
    fecha_captura: new Date().toISOString().split('T')[0],
    hora_captura: new Date().toTimeString().split(' ')[0].substring(0, 5),
    observaciones: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        drv_id: initialData.drv_id,
        valor_inicial: initialData.valor_inicial,
        valor_final: initialData.valor_final,
        fecha_captura: initialData.fecha_captura ? initialData.fecha_captura.split('T')[0] : '',
        hora_captura: initialData.hora_captura || '',
        observaciones: initialData.observaciones || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const corte = Number(formData.valor_final) >= formData.valor_inicial 
    ? (Number(formData.valor_final) - formData.valor_inicial).toFixed(2) 
    : '0.00';

  const isValid = Number(formData.valor_final) >= formData.valor_inicial && formData.valor_final !== '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      ...formData,
      valor_final: Number(formData.valor_final)
    });
  };

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-2xl font-bold">
          {initialData?.id ? 'Editar Registro' : 'Nuevo Registro de DRV'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Valor Inicial</Label>
              <Input value={formData.valor_inicial} disabled className="bg-muted font-mono" />
              <p className="text-xs text-muted-foreground">Proviene del DRV o último corte</p>
            </div>
            <div className="space-y-2">
              <Label>Valor Final *</Label>
              <Input 
                type="number" 
                name="valor_final" 
                value={formData.valor_final} 
                onChange={handleChange} 
                min={formData.valor_inicial}
                step="0.01"
                required 
                className={!isValid && formData.valor_final !== '' ? 'border-destructive' : ''}
              />
              {!isValid && formData.valor_final !== '' && (
                <p className="text-xs text-destructive">El valor final debe ser mayor o igual al inicial.</p>
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2 bg-primary/5 p-4 rounded-xl border border-primary/20">
              <Label className="text-primary font-semibold">Corte Calculado</Label>
              <div className="text-3xl font-bold text-foreground font-mono">{corte}</div>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Captura *</Label>
              <Input type="date" name="fecha_captura" value={formData.fecha_captura} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Hora de Captura *</Label>
              <Input type="time" name="hora_captura" value={formData.hora_captura} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={3} />
          </div>

          <div className="pt-4 flex gap-4">
            <Button type="submit" disabled={isLoading || !isValid} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? 'Guardando...' : 'Guardar Registro'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DRVReadingsForm;