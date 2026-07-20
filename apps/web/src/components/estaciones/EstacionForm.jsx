import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Save, Loader2, Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import pb from '@/lib/pocketbaseClient.js';

const EstacionForm = ({ initialData, onSubmit, isLoading, isEditMode }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [openColab, setOpenColab] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    rol: '',
    calle: '',
    numero: '',
    colonia: '',
    municipio: '',
    estado: '',
    telefono: '',
    responsable_id: '',
    colaboradores: [],
    estado_estacion: 'activa'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        rol: initialData.rol || '',
        calle: initialData.calle || '',
        numero: initialData.numero || '',
        colonia: initialData.colonia || '',
        municipio: initialData.municipio || '',
        estado: initialData.estado || '',
        telefono: initialData.telefono || '',
        responsable_id: initialData.responsable_id || '',
        colaboradores: Array.isArray(initialData.colaboradores) ? initialData.colaboradores : [],
        estado_estacion: initialData.estado_estacion || 'activa'
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const records = await pb.collection('users').getFullList({
          sort: 'email',
          $autoCancel: false
        });
        setUsers(records);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'responsable_id' && newData.colaboradores.includes(value)) {
        newData.colaboradores = newData.colaboradores.filter(id => id !== value);
      }
      
      return newData;
    });
  };

  const toggleColaborador = (userId) => {
    setFormData(prev => {
      const isSelected = prev.colaboradores.includes(userId);
      if (isSelected) {
        return { ...prev, colaboradores: prev.colaboradores.filter(id => id !== userId) };
      } else {
        return { ...prev, colaboradores: [...prev.colaboradores, userId] };
      }
    });
  };

  const removeColaborador = (userId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      colaboradores: prev.colaboradores.filter(id => id !== userId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <h3 className="text-lg font-semibold border-b pb-2">Información Principal</h3>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre de la Estación *</label>
          <Input 
            name="nombre" 
            value={formData.nombre} 
            onChange={handleChange} 
            placeholder="Ej. Estación Central" 
            required 
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Rol *</label>
          <Select value={formData.rol} onValueChange={(val) => handleSelectChange('rol', val)} required disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PLANTA">PLANTA</SelectItem>
              <SelectItem value="DE CARBURACIÓN">DE CARBURACIÓN</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Responsable (Único) *</label>
          <Select value={formData.responsable_id} onValueChange={(val) => handleSelectChange('responsable_id', val)} required disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un responsable" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Estado</label>
          <Select value={formData.estado_estacion} onValueChange={(val) => handleSelectChange('estado_estacion', val)} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activa">Activa</SelectItem>
              <SelectItem value="inactiva">Inactiva</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Colaboradores (Múltiple)</label>
          <Popover open={openColab} onOpenChange={setOpenColab}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                role="combobox" 
                aria-expanded={openColab} 
                className="w-full justify-between font-normal bg-background hover:bg-background"
                disabled={isLoading}
              >
                <span className="text-muted-foreground">Seleccionar colaboradores...</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar usuario..." />
                <CommandList>
                  <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                  <CommandGroup>
                    {users
                      .filter(u => u.id !== formData.responsable_id)
                      .map(user => (
                      <CommandItem
                        key={user.id}
                        value={user.email}
                        onSelect={() => toggleColaborador(user.id)}
                      >
                        <Check 
                          className={cn(
                            "mr-2 h-4 w-4", 
                            formData.colaboradores.includes(user.id) ? "opacity-100 text-primary" : "opacity-0"
                          )} 
                        />
                        {user.email} <span className="text-xs text-muted-foreground ml-2">({user.role})</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {formData.colaboradores.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/30 rounded-lg border border-border/50">
              {formData.colaboradores.map(id => {
                const u = users.find(u => u.id === id);
                if (!u) return null;
                return (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5 bg-background border-border shadow-sm">
                    <span className="font-medium">{u.email.split('@')[0]}</span>
                    <button 
                      type="button" 
                      onClick={(e) => removeColaborador(id, e)} 
                      className="text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10 p-0.5"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remover {u.email}</span>
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2 md:col-span-2 mt-4">
          <h3 className="text-lg font-semibold border-b pb-2">Ubicación y Contacto</h3>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Calle</label>
          <Input name="calle" value={formData.calle} onChange={handleChange} placeholder="Calle" disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Número</label>
          <Input name="numero" value={formData.numero} onChange={handleChange} placeholder="Número exterior/interior" disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Colonia</label>
          <Input name="colonia" value={formData.colonia} onChange={handleChange} placeholder="Colonia" disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Municipio</label>
          <Input name="municipio" value={formData.municipio} onChange={handleChange} placeholder="Municipio" disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Estado (Entidad Federativa)</label>
          <Input name="estado" value={formData.estado} onChange={handleChange} placeholder="Estado" disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Teléfono</label>
          <Input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono de contacto" disabled={isLoading} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="min-w-[140px]">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isEditMode ? 'Guardar Cambios' : 'Crear Estación'}
        </Button>
      </div>
    </form>
  );
};

export default EstacionForm;