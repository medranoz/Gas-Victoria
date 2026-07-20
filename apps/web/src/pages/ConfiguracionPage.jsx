import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useConfiguracion } from '@/hooks/useConfiguracion.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Pencil, Loader2, Trash2, AlertCircle, RefreshCw, Plus, LayoutGrid, Image as ImageIcon, CircleDollarSign, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const ConfiguracionPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getZonasRutas, getCostosZonas, guardarCosto, eliminarCosto } = useConfiguracion();
  
  const [zonas, setZonas] = useState([]);
  const [costos, setCostos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  
  // Form State
  const [formZona, setFormZona] = useState('');
  const [formUnidad, setFormUnidad] = useState('');
  const [formCosto, setFormCosto] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editZona, setEditZona] = useState('');
  const [editUnidad, setEditUnidad] = useState('');
  const [editCosto, setEditCosto] = useState('');
  const [editErrors, setEditErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const userRole = currentUser?.role?.toLowerCase() || '';

  useEffect(() => {
    if (!userRole) {
      toast.error('Rol de usuario no configurado.');
      navigate('/');
      return;
    }
    if (userRole !== 'superadmin' && userRole !== 'administrador') {
      toast.error('Acceso denegado. Se requieren permisos de administración.');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [currentUser, userRole, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setErrorState(false);
    
    const [zonasRes, costosRes] = await Promise.all([
      getZonasRutas(),
      getCostosZonas()
    ]);

    if (zonasRes.success && costosRes.success) {
      setZonas(zonasRes.data);
      setCostos(costosRes.data);
    } else {
      setErrorState(true);
      toast.error('Error al cargar los datos.');
    }
    setLoading(false);
  };

  const validateForm = (zona, unidad, costo) => {
    const errors = {};
    if (!zona) errors.zona = 'Selecciona una zona o ruta.';
    if (!unidad) errors.unidad = 'Selecciona una unidad de medida.';
    
    const costoNum = parseFloat(costo);
    if (!costo || isNaN(costoNum) || costoNum <= 0) {
      errors.costo = 'Ingresa un costo válido mayor a 0.';
    }
    return errors;
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formZona, formUnidad, formCosto);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    const res = await guardarCosto(formZona, formUnidad, formCosto, currentUser.email);
    
    if (res.success) {
      const zonaName = zonas.find(z => z.id === formZona)?.nombre || 'Zona';
      toast.success(`Costo ${res.action === 'created' ? 'asignado' : 'actualizado'} para ${zonaName} - ${formUnidad}`);
      setFormZona('');
      setFormUnidad('');
      setFormCosto('');
      setFormErrors({});
      fetchData();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  const openEditModal = (costoRecord) => {
    setEditId(costoRecord.id);
    setEditZona(costoRecord.zona_ruta);
    setEditUnidad(costoRecord.unidad_medida);
    setEditCosto(costoRecord.costo.toString());
    setEditErrors({});
    setIsEditOpen(true);
  };

  const handleEditSubmit = async () => {
    const errors = validateForm(editZona, editUnidad, editCosto);
    setEditErrors(errors);
    
    if (Object.keys(errors).length > 0) return;

    setIsEditing(true);
    const res = await guardarCosto(editZona, editUnidad, editCosto, currentUser.email);
    
    if (res.success) {
      const zonaName = zonas.find(z => z.id === editZona)?.nombre || 'Zona';
      toast.success(`Costo actualizado para ${zonaName} - ${editUnidad}`);
      setIsEditOpen(false);
      fetchData();
    } else {
      toast.error(res.message);
    }
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este costo?')) {
      const res = await eliminarCosto(id);
      if (res.success) {
        toast.success('Costo eliminado');
        fetchData();
      } else {
        toast.error(res.message);
      }
    }
  };

  const scrollToForm = () => {
    document.getElementById('asignacion-costos-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!userRole || (userRole !== 'superadmin' && userRole !== 'administrador')) return null;

  return (
    <>
      <Helmet>
        <title>Configuración - Gas Victoria</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-foreground">Configuración del Sistema</h1>
                <p className="text-muted-foreground text-lg">Gestiona la plataforma, módulos y costos operativos.</p>
              </div>
            </div>

            {/* Menu Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-border group" onClick={() => navigate('/configuracion/modulos')}>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Configuración de Módulos</h3>
                  <p className="text-sm text-muted-foreground flex-1">Ordena, activa o desactiva los módulos del sistema y gestiona los permisos por rol.</p>
                  <div className="mt-4 flex items-center text-primary text-sm font-medium">
                    Administrar <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer border-border group" onClick={() => navigate('/configuracion/logotipos')}>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Gestión de Logotipos</h3>
                  <p className="text-sm text-muted-foreground flex-1">Personaliza los logotipos, icono y marca de agua en las distintas vistas de la aplicación.</p>
                  <div className="mt-4 flex items-center text-primary text-sm font-medium">
                    Administrar <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer border-border group" onClick={scrollToForm}>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CircleDollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Costos por Zona</h3>
                  <p className="text-sm text-muted-foreground flex-1">Actualiza los costos del gas por litro o kilogramo según la zona de reparto.</p>
                  <div className="mt-4 flex items-center text-primary text-sm font-medium">
                    Ir a sección <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-10">
              
              {/* Section: Asignación de Costos */}
              <Card id="asignacion-costos-form" className="shadow-md border-border/50 scroll-mt-24">
                <CardHeader className="bg-card pb-6 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Asignación de Costos Operativos</CardTitle>
                    <CardDescription className="text-base">Asigna o actualiza el costo por unidad para una zona específica.</CardDescription>
                  </div>
                  <Button onClick={scrollToForm} size="sm" className="shrink-0 hidden">
                    <Plus className="mr-2 h-4 w-4" /> Agregar
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleAssignSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start mb-10">
                    <div className="space-y-2 md:col-span-1">
                      <Label>Zona / Ruta <span className="text-destructive">*</span></Label>
                      <Select value={formZona} onValueChange={setFormZona}>
                        <SelectTrigger className={formErrors.zona ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Seleccionar zona" />
                        </SelectTrigger>
                        <SelectContent>
                          {zonas.map(z => (
                            <SelectItem key={z.id} value={z.id}>{z.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.zona && <p className="text-sm text-destructive">{formErrors.zona}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <Label>Unidad de Medida <span className="text-destructive">*</span></Label>
                      <RadioGroup value={formUnidad} onValueChange={setFormUnidad} className="flex flex-col space-y-1 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="litro" id="unit-litro" />
                          <Label htmlFor="unit-litro" className="font-normal">Litro</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="kilogramo" id="unit-kilo" />
                          <Label htmlFor="unit-kilo" className="font-normal">Kilogramo</Label>
                        </div>
                      </RadioGroup>
                      {formErrors.unidad && <p className="text-sm text-destructive">{formErrors.unidad}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <Label>Costo ($) <span className="text-destructive">*</span></Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        value={formCosto} 
                        onChange={(e) => setFormCosto(e.target.value)}
                        className={formErrors.costo ? 'border-destructive' : ''}
                      />
                      {formErrors.costo && <p className="text-sm text-destructive">{formErrors.costo}</p>}
                    </div>

                    <div className="md:col-span-1 flex items-end h-full pb-1">
                      <Button type="submit" className="w-full" disabled={isSubmitting || !formZona || !formUnidad || !formCosto}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Guardar Costo
                      </Button>
                    </div>
                  </form>

                  <div className="flex items-center justify-between mb-4 mt-8 border-t pt-8">
                    <h3 className="text-lg font-semibold">Costos Registrados</h3>
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Actualizar tabla
                    </Button>
                  </div>

                  {loading ? (
                    <div className="space-y-3 mt-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : errorState ? (
                    <div className="text-center py-12 bg-destructive/10 rounded-lg border border-destructive/20 mt-4">
                      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
                      <p className="text-destructive font-medium">Error al cargar los datos.</p>
                      <Button variant="outline" className="mt-4" onClick={fetchData}>Reintentar</Button>
                    </div>
                  ) : costos.length === 0 ? (
                    <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed mt-4">
                      <p className="text-muted-foreground font-medium">No hay costos registrados.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border mt-4">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="font-semibold text-foreground">Zona</TableHead>
                            <TableHead className="font-semibold text-foreground">Costo</TableHead>
                            <TableHead className="font-semibold text-foreground">Unidad de Medida</TableHead>
                            <TableHead className="font-semibold text-foreground">Fecha Actualización</TableHead>
                            <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {costos.map((costo) => (
                            <TableRow key={costo.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="font-medium text-foreground">{costo.expand?.zona_ruta?.nombre || 'Desconocida'}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  ${Number(costo.costo).toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell className="capitalize">{costo.unidad_medida}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {costo.fecha_actualizacion} <br/>
                                <span className="text-xs opacity-70">{costo.actualizado_por}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={() => openEditModal(costo)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDelete(costo.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Editar Costo</DialogTitle>
                  <DialogDescription>Modifica los valores del costo seleccionado.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Zona / Ruta</Label>
                    <Select value={editZona} onValueChange={setEditZona} disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar zona" />
                      </SelectTrigger>
                      <SelectContent>
                        {zonas.map(z => (
                          <SelectItem key={z.id} value={z.id}>{z.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unidad de Medida</Label>
                    <Select value={editUnidad} onValueChange={setEditUnidad} disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="litro">Litro</SelectItem>
                        <SelectItem value="kilogramo">Kilogramo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Costo ($) <span className="text-destructive">*</span></Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0"
                      value={editCosto} 
                      onChange={(e) => setEditCosto(e.target.value)}
                      className={editErrors.costo ? 'border-destructive' : ''}
                    />
                    {editErrors.costo && <p className="text-sm text-destructive">{editErrors.costo}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isEditing}>Cancelar</Button>
                  <Button onClick={handleEditSubmit} disabled={isEditing}>
                    {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ConfiguracionPage;