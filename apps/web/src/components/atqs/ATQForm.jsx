import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useATQs } from '@/hooks/useATQs.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { ArrowLeft, Save, CalendarClock, ShieldCheck, Truck } from 'lucide-react';
import { toast } from 'sonner';

const ATQForm = ({ atqId }) => {
  const navigate = useNavigate();
  const { createATQ, updateATQ, getATQById, generateNextATQId } = useATQs();
  const [initialLoading, setInitialLoading] = useState(!!atqId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    atq_id: '',
    placa: '',
    registro_contable: '',
    id_cre: '',
    niv: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    rol_tanque: '',
    estado_actual: 'ACTIVO',
    fecha_mantenimiento: '',
    notificacion_mantenimiento: false,
    observaciones: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initForm = async () => {
      if (atqId) {
        const res = await getATQById(atqId);
        if (res.success) {
          setFormData({
            atq_id: res.data.atq_id || '',
            placa: res.data.placa || '',
            registro_contable: res.data.registro_contable || '',
            id_cre: res.data.id_cre || '',
            niv: res.data.niv || '',
            marca: res.data.marca || '',
            modelo: res.data.modelo || '',
            anio: res.data.anio || new Date().getFullYear(),
            rol_tanque: res.data.rol_tanque || '',
            estado_actual: res.data.estado_actual || 'ACTIVO',
            fecha_mantenimiento: res.data.fecha_mantenimiento ? res.data.fecha_mantenimiento.split('T')[0] : '',
            notificacion_mantenimiento: res.data.notificacion_mantenimiento || false,
            observaciones: res.data.observaciones || ''
          });
        }
        setInitialLoading(false);
      } else {
        const nextId = await generateNextATQId();
        setFormData(prev => ({ ...prev, atq_id: nextId }));
        setInitialLoading(false);
      }
    };
    initForm();
  }, [atqId, getATQById, generateNextATQId]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'placa') {
      value = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({ ...prev, notificacion_mantenimiento: checked }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.atq_id.match(/^ATQ-\d{4}$/)) newErrors.atq_id = 'Formato inválido (ej. ATQ-0001)';
    if (!formData.placa) {
      newErrors.placa = 'La placa es requerida';
    } else if (!formData.placa.match(/^[A-Za-z0-9]+$/)) {
      newErrors.placa = 'Placa debe contener solo caracteres alfanuméricos sin espacios ni guiones';
    }
    if (!formData.registro_contable) {
      newErrors.registro_contable = 'El registro contable es requerido';
    }
    
    // ID CRE validation: Only check if it's provided. No format restrictions.
    if (!formData.id_cre || !formData.id_cre.trim()) {
      newErrors.id_cre = 'El ID CRE es requerido';
    }
    
    if (formData.niv.length !== 17) newErrors.niv = 'NIV debe tener exactamente 17 caracteres';
    if (!formData.marca.trim()) newErrors.marca = 'La marca es requerida';
    if (!formData.modelo.trim()) newErrors.modelo = 'El modelo es requerido';
    if (!formData.anio || formData.anio < 1980 || formData.anio > new Date().getFullYear() + 1) newErrors.anio = 'Año inválido';
    if (!formData.rol_tanque) newErrors.rol_tanque = 'Debe seleccionar un rol';
    if (!formData.estado_actual) newErrors.estado_actual = 'Debe seleccionar un estado';
    
    if (formData.fecha_mantenimiento) {
      const maintDate = new Date(formData.fecha_mantenimiento + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (maintDate < today) {
        newErrors.fecha_mantenimiento = 'La fecha de mantenimiento no puede ser en el pasado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    let res;
    if (atqId) {
      res = await updateATQ(atqId, formData);
    } else {
      res = await createATQ(formData);
    }

    setIsSubmitting(false);
    if (res.success) {
      navigate('/atqs');
    }
  };

  if (initialLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full mt-8" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate('/atqs')} className="hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <CardTitle className="text-2xl">{atqId ? 'Editar ATQ' : 'Registrar Nuevo ATQ'}</CardTitle>
            <CardDescription>{atqId ? 'Actualiza los datos del autotanque.' : 'Ingresa los detalles del nuevo autotanque.'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
              <Truck className="w-5 h-5 text-muted-foreground" />
              Identificación del Vehículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="atq_id">ID de ATQ *</Label>
                <Input 
                  id="atq_id" 
                  name="atq_id" 
                  value={formData.atq_id} 
                  onChange={handleChange} 
                  disabled={!!atqId} 
                  className={errors.atq_id ? 'border-destructive text-foreground' : 'text-foreground'}
                  placeholder="ATQ-0001"
                />
                {errors.atq_id && <p className="text-xs text-destructive">{errors.atq_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input 
                  id="placa" 
                  name="placa" 
                  value={formData.placa} 
                  onChange={handleChange} 
                  maxLength={10}
                  className={`uppercase ${errors.placa ? 'border-destructive text-foreground' : 'text-foreground'}`}
                  placeholder="PL4442A"
                />
                {errors.placa && <p className="text-xs text-destructive">{errors.placa}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="niv">NIV (Número de Identificación Vehicular) *</Label>
                <Input 
                  id="niv" 
                  name="niv" 
                  value={formData.niv} 
                  onChange={handleChange} 
                  disabled={!!atqId} 
                  maxLength={17}
                  className={`uppercase ${errors.niv ? 'border-destructive text-foreground' : 'text-foreground'}`}
                  placeholder="17 caracteres alfanuméricos"
                />
                {errors.niv && <p className="text-xs text-destructive">{errors.niv}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input 
                  id="marca" 
                  name="marca" 
                  value={formData.marca} 
                  onChange={handleChange} 
                  className={`${errors.marca ? 'border-destructive text-foreground' : 'text-foreground'}`}
                />
                {errors.marca && <p className="text-xs text-destructive">{errors.marca}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input 
                  id="modelo" 
                  name="modelo" 
                  value={formData.modelo} 
                  onChange={handleChange} 
                  className={`${errors.modelo ? 'border-destructive text-foreground' : 'text-foreground'}`}
                />
                {errors.modelo && <p className="text-xs text-destructive">{errors.modelo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="anio">Año *</Label>
                <Input 
                  id="anio" 
                  name="anio" 
                  type="number" 
                  value={formData.anio} 
                  onChange={handleChange} 
                  className={`${errors.anio ? 'border-destructive text-foreground' : 'text-foreground'}`}
                />
                {errors.anio && <p className="text-xs text-destructive">{errors.anio}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 mt-2">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
              Regulación y Operación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="id_cre">ID CRE *</Label>
                <Input 
                  id="id_cre" 
                  name="id_cre" 
                  value={formData.id_cre} 
                  onChange={handleChange} 
                  className={errors.id_cre ? 'border-destructive text-foreground' : 'text-foreground'}
                  placeholder="Ej. AAO1532163"
                />
                {errors.id_cre && <p className="text-xs text-destructive">{errors.id_cre}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registro_contable">Registro Contable *</Label>
                <Input 
                  id="registro_contable" 
                  name="registro_contable" 
                  value={formData.registro_contable} 
                  onChange={handleChange} 
                  maxLength={50}
                  className={`uppercase ${errors.registro_contable ? 'border-destructive text-foreground' : 'text-foreground'}`}
                  placeholder="AT.#50"
                />
                {errors.registro_contable && <p className="text-xs text-destructive">{errors.registro_contable}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol_tanque">Rol del Tanque *</Label>
                <Select value={formData.rol_tanque} onValueChange={(v) => handleSelectChange('rol_tanque', v)}>
                  <SelectTrigger className={errors.rol_tanque ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DE TRASPASO">DE TRASPASO</SelectItem>
                    <SelectItem value="DE CONTADO">DE CONTADO</SelectItem>
                  </SelectContent>
                </Select>
                {errors.rol_tanque && <p className="text-xs text-destructive">{errors.rol_tanque}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado_actual">Estado Actual *</Label>
                <Select value={formData.estado_actual} onValueChange={(v) => handleSelectChange('estado_actual', v)}>
                  <SelectTrigger className={errors.estado_actual ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                    <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                    <SelectItem value="EN MANTENIMIENTO">EN MANTENIMIENTO</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado_actual && <p className="text-xs text-destructive">{errors.estado_actual}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 mt-2">
              <CalendarClock className="w-5 h-5 text-muted-foreground" />
              Mantenimiento Programado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/10 p-5 rounded-xl border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="fecha_mantenimiento">Próxima Fecha de Mantenimiento</Label>
                <Input 
                  id="fecha_mantenimiento" 
                  name="fecha_mantenimiento" 
                  type="date"
                  value={formData.fecha_mantenimiento} 
                  onChange={handleChange} 
                  className={`${errors.fecha_mantenimiento ? 'border-destructive text-foreground' : 'text-foreground'}`}
                />
                {errors.fecha_mantenimiento && <p className="text-xs text-destructive">{errors.fecha_mantenimiento}</p>}
                <p className="text-xs text-muted-foreground">Opcional. Permite programar alertas automáticas en el sistema.</p>
              </div>

              <div className="flex flex-col justify-center space-y-3 pt-6">
                <div className="flex items-center space-x-3 bg-background p-3 rounded-lg border border-border shadow-sm">
                  <Checkbox 
                    id="notificacion_mantenimiento" 
                    checked={formData.notificacion_mantenimiento}
                    onCheckedChange={handleCheckboxChange}
                    disabled={!formData.fecha_mantenimiento}
                  />
                  <Label 
                    htmlFor="notificacion_mantenimiento" 
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${!formData.fecha_mantenimiento ? 'text-muted-foreground' : 'text-foreground cursor-pointer'}`}
                  >
                    Activar notificación de mantenimiento
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-1">El sistema notificará 7 días antes y el día del mantenimiento.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
            <Textarea 
              id="observaciones" 
              name="observaciones" 
              value={formData.observaciones} 
              onChange={handleChange} 
              className="text-foreground resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => navigate('/atqs')} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? 'Guardando...' : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Guardar ATQ
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ATQForm;