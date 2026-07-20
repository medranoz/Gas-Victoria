import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import IconSelector from './IconSelector.jsx';
import RoleSelector from './RoleSelector.jsx';
import { Loader2, CheckCircle2, AlertTriangle, Eye, Database } from 'lucide-react';
import { toast } from 'sonner';
import { VALID_COLLECTIONS } from '@/hooks/useModulosConfig.js';

const ModuleForm = ({ initialData, onSubmit, onCancel, isLoading, validateModule }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: 'Header Principal',
    orden: 1,
    estado: true,
    icono: 'LayoutDashboard',
    roles_permitidos: [],
    colecciones: []
  });
  
  const [errors, setErrors] = useState({});
  const [testStatus, setTestStatus] = useState(null); // null, 'testing', 'success', 'warning'

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        roles_permitidos: initialData.roles_permitidos || [],
        colecciones: Array.isArray(initialData.colecciones) ? initialData.colecciones : []
      });
    }
  }, [initialData]);

  // Real-time validation
  useEffect(() => {
    if (validateModule) {
      const validationErrors = validateModule(formData, initialData?.id);
      setErrors(validationErrors);
    }
  }, [formData, validateModule, initialData?.id]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTestStatus(null);
  };

  const handleCollectionToggle = (colName) => {
    setFormData(prev => {
      const current = prev.colecciones || [];
      if (current.includes(colName)) {
        return { ...prev, colecciones: current.filter(c => c !== colName) };
      } else {
        return { ...prev, colecciones: [...current, colName] };
      }
    });
  };

  const handleTestConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      if (errors.colecciones) {
        setTestStatus('warning');
      } else {
        setTestStatus('success');
      }
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;
    onSubmit(formData);
  };

  const handlePreview = () => {
    toast.info(`Vista previa simulada: ${formData.nombre}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className={errors.nombre ? "text-destructive" : ""}>Nombre del Módulo *</Label>
        <Input 
          value={formData.nombre} 
          onChange={(e) => handleChange('nombre', e.target.value)} 
          className={errors.nombre ? "border-destructive focus-visible:ring-destructive" : ""}
          placeholder="Ej: Inventario"
        />
        {errors.nombre && <p className="text-sm text-destructive">{errors.nombre}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ubicación *</Label>
          <Select value={formData.ubicacion} onValueChange={(v) => handleChange('ubicacion', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Header Principal">Header Principal</SelectItem>
              <SelectItem value="Sección Dashboard">Sección Dashboard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className={errors.orden ? "text-destructive" : ""}>Orden de Visualización *</Label>
          <Input 
            type="number" 
            min="1" 
            value={formData.orden} 
            onChange={(e) => handleChange('orden', parseInt(e.target.value) || 1)} 
            className={errors.orden ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.orden && <p className="text-sm text-destructive">{errors.orden}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Icono Visual</Label>
        <IconSelector value={formData.icono} onChange={(v) => handleChange('icono', v)} />
      </div>

      <div className="space-y-2">
        <Label>Roles Permitidos (Dejar vacío para acceso global)</Label>
        <RoleSelector selectedRoles={formData.roles_permitidos} onChange={(v) => handleChange('roles_permitidos', v)} />
      </div>

      <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            Colecciones Asociadas
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={handleTestConnection} disabled={testStatus === 'testing'}>
            {testStatus === 'testing' ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : 'Verificar DB'}
          </Button>
        </div>
        
        {testStatus === 'success' && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Conexión a colecciones verificada</p>}
        {testStatus === 'warning' && <p className="text-xs text-yellow-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Advertencia: Algunas colecciones no existen</p>}
        {errors.colecciones && <p className="text-xs text-destructive">{errors.colecciones}</p>}

        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
          {VALID_COLLECTIONS.map(col => {
            const isSelected = formData.colecciones?.includes(col);
            return (
              <Badge 
                key={col} 
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary hover:bg-primary/90' : 'hover:bg-muted'}`}
                onClick={() => handleCollectionToggle(col)}
              >
                {col}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
        <div className="space-y-0.5">
          <Label className="text-base">Módulo Activo</Label>
          <p className="text-sm text-muted-foreground">Si está inactivo, no será visible para nadie.</p>
        </div>
        <Switch 
          checked={formData.estado} 
          onCheckedChange={(v) => handleChange('estado', v)} 
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" /> Previsualizar
          </Button>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || Object.keys(errors).length > 0}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar Módulo
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ModuleForm;