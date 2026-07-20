import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Save, Loader2, DatabaseZap, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

import { useTanqueAPI } from '@/hooks/useTanqueAPI.js';
import { calcularCapacidadPermitida } from '@/hooks/useTanqueCalculations.js';
import pb from '@/lib/pocketbaseClient.js';

const CreateCargaPage = () => {
  const navigate = useNavigate();
  const { generateTanqueNumber, fetchATQs, createTanque } = useTanqueAPI();
  
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [drvs, setDrvs] = useState({ data: [], loading: true, error: null });
  const [proveedores, setProveedores] = useState({ data: [], loading: true, error: null });
  const [estaciones, setEstaciones] = useState({ data: [], loading: true, error: null });
  const [atqs, setAtqs] = useState({ data: [], loading: true, error: null });

  const [formData, setFormData] = useState({
    capacidad_total: '',
    drv_id: '',
    origen_carga: '',
    proveedor_id: '',
    estacion_id: '',
    atq_id: '',
    notificacion_activa: false,
    fecha_notificacion: ''
  });

  const loadDrvs = async () => {
    setDrvs(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await pb.collection('drv').getFullList({ filter: 'estado="activo"', $autoCancel: false });
      setDrvs({ data, loading: false, error: null });
    } catch (e) {
      console.error("Error fetching DRVs:", e);
      setDrvs({ data: [], loading: false, error: "No se pudieron cargar los DRVs." });
    }
  };

  const loadProveedores = async () => {
    setProveedores(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await pb.collection('proveedores').getFullList({ filter: 'estado="Activo"', $autoCancel: false });
      setProveedores({ data, loading: false, error: null });
    } catch (e) {
      console.error("Error fetching Proveedores:", e);
      setProveedores({ data: [], loading: false, error: "No se pudieron cargar los proveedores." });
    }
  };

  const loadEstaciones = async () => {
    setEstaciones(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await pb.collection('estaciones').getFullList({ filter: 'rol="DE CARBURACIÓN"', $autoCancel: false });
      setEstaciones({ data, loading: false, error: null });
    } catch (e) {
      console.error("Error fetching Estaciones:", e);
      setEstaciones({ data: [], loading: false, error: "No se pudieron cargar las estaciones." });
    }
  };

  const loadAtqs = async () => {
    setAtqs(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchATQs();
      setAtqs({ data, loading: false, error: null });
    } catch (e) {
      console.error("Error fetching ATQs:", e);
      setAtqs({ data: [], loading: false, error: "No se pudieron cargar los autotanques." });
    }
  };

  useEffect(() => {
    loadDrvs();
    loadProveedores();
    loadEstaciones();
    loadAtqs();
  }, [fetchATQs]);

  const isAnyLoading = drvs.loading || proveedores.loading || estaciones.loading || atqs.loading;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear validation error when field changes
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'origen_carga') {
        next.proveedor_id = '';
        next.estacion_id = '';
        next.atq_id = '';
      }
      return next;
    });
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const ct = Number(formData.capacidad_total);
    
    if (!formData.capacidad_total || ct < 1) {
      errors.capacidad_total = "La capacidad total debe ser mayor a 0.";
    }
    
    if (!formData.drv_id) {
      errors.drv_id = "Debe seleccionar un dispositivo DRV.";
    }

    if (!formData.origen_carga) {
      errors.origen_carga = "Debe seleccionar un origen de carga válido ('Estacion', 'Autotanque', 'Proveedor').";
    } else {
      if (formData.origen_carga === 'Estacion') {
        if (!formData.estacion_id) {
          errors.estacion_id = "Debe seleccionar una estación de carburación válida y activa.";
        } else {
          const estacion = estaciones.data.find(e => e.id === formData.estacion_id);
          if (!estacion || estacion.rol !== 'DE CARBURACIÓN') {
            errors.estacion_id = "La estación seleccionada no cumple con el rol requerido.";
          }
        }
      }
      else if (formData.origen_carga === 'Autotanque') {
        if (!formData.atq_id) {
          errors.atq_id = "Debe seleccionar un autotanque de traspaso activo.";
        } else {
          const atq = atqs.data.find(a => a.id === formData.atq_id);
          if (!atq || atq.rol_tanque !== 'DE TRASPASO' || atq.estado_actual !== 'ACTIVO') {
            errors.atq_id = "El autotanque seleccionado no está activo o no es de traspaso.";
          }
        }
      }
      else if (formData.origen_carga === 'Proveedor') {
        if (!formData.proveedor_id) {
          errors.proveedor_id = "Debe seleccionar un proveedor válido y activo.";
        } else {
          const prov = proveedores.data.find(p => p.id === formData.proveedor_id);
          if (!prov || prov.estado !== 'Activo') {
            errors.proveedor_id = "El proveedor seleccionado no está activo.";
          }
        }
      }
    }

    if (formData.notificacion_activa && !formData.fecha_notificacion) {
      errors.fecha_notificacion = "Debe seleccionar una fecha de notificación.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const ct = Number(formData.capacidad_total);
  const cp = useMemo(() => calcularCapacidadPermitida(ct), [ct]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor, corrija los errores en el formulario.');
      return;
    }

    setSubmitting(true);
    try {
      const numTanque = await generateTanqueNumber();
      
      // Map 'Estacion' to 'Planta' if required by the PocketBase schema
      const mappedOrigen = formData.origen_carga === 'Estacion' ? 'Planta' : formData.origen_carga;
      
      const payload = {
        numero_tanque: numTanque,
        capacidad_total: ct,
        capacidad_permitida: cp,
        carga_disponible_inicial: 0,
        carga_disponible_litros: 0,
        carga_faltante: cp,
        estado: 'Activo',
        drv_id: formData.drv_id,
        origen_carga: mappedOrigen,
        notificacion_activa: formData.notificacion_activa,
      };

      if (formData.origen_carga === 'Proveedor') payload.proveedor_id = formData.proveedor_id;
      if (formData.origen_carga === 'Estacion') payload.estacion_id = formData.estacion_id;
      if (formData.origen_carga === 'Autotanque') payload.atq_id = formData.atq_id; // Include ATQ if backend schema allows it
      
      if (formData.notificacion_activa && formData.fecha_notificacion) {
        payload.fecha_notificacion = new Date(formData.fecha_notificacion).toISOString();
      }

      await createTanque(payload);
      toast.success(`Tanque de Carga ${numTanque} creado correctamente.`);
      navigate('/carga');
    } catch (e) {
      console.error(e);
      toast.error('Error al crear el Tanque de Carga. Verifique los datos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Nuevo Tanque de Carga - Gas Victoria</title></Helmet>
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Button variant="ghost" asChild className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <Link to="/carga"><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Control de Carga</Link>
        </Button>

        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
            <DatabaseZap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Nuevo Tanque de Carga</h1>
            <p className="text-muted-foreground mt-1">Registra un nuevo tanque para el control de inventario de gas.</p>
          </div>
        </div>

        {/* Global Error Boundaries & Loading States for Dependencies */}
        <div className="space-y-3 mb-6">
          {isAnyLoading && (
            <div className="bg-card border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm">Cargando dependencias...</h3>
              <div className="flex flex-wrap gap-4">
                {drvs.loading && <div className="text-sm text-muted-foreground flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> DRVs</div>}
                {estaciones.loading && <div className="text-sm text-muted-foreground flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Estaciones</div>}
                {atqs.loading && <div className="text-sm text-muted-foreground flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Autotanques</div>}
                {proveedores.loading && <div className="text-sm text-muted-foreground flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Proveedores</div>}
              </div>
            </div>
          )}
          
          {drvs.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error en DRVs</AlertTitle>
              <AlertDescription className="flex items-center justify-between mt-2">
                <span>{drvs.error}</span>
                <Button variant="outline" size="sm" onClick={loadDrvs}><RefreshCw className="w-3 h-3 mr-2"/> Reintentar</Button>
              </AlertDescription>
            </Alert>
          )}
          {estaciones.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error en Estaciones</AlertTitle>
              <AlertDescription className="flex items-center justify-between mt-2">
                <span>{estaciones.error}</span>
                <Button variant="outline" size="sm" onClick={loadEstaciones}><RefreshCw className="w-3 h-3 mr-2"/> Reintentar</Button>
              </AlertDescription>
            </Alert>
          )}
          {atqs.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error en Autotanques</AlertTitle>
              <AlertDescription className="flex items-center justify-between mt-2">
                <span>{atqs.error}</span>
                <Button variant="outline" size="sm" onClick={loadAtqs}><RefreshCw className="w-3 h-3 mr-2"/> Reintentar</Button>
              </AlertDescription>
            </Alert>
          )}
          {proveedores.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error en Proveedores</AlertTitle>
              <AlertDescription className="flex items-center justify-between mt-2">
                <span>{proveedores.error}</span>
                <Button variant="outline" size="sm" onClick={loadProveedores}><RefreshCw className="w-3 h-3 mr-2"/> Reintentar</Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Card className="border shadow-sm rounded-2xl overflow-hidden relative">
          {/* Overlay to disable interaction while loading */}
          {isAnyLoading && (
            <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
              <div className="bg-background border shadow-lg rounded-full px-4 py-2 flex items-center text-sm font-medium">
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" /> Preparando formulario...
              </div>
            </div>
          )}
          
          <CardHeader className="bg-card border-b bg-muted/10">
            <CardTitle className="text-xl">Información del Equipo</CardTitle>
            <CardDescription>El número de tanque se asignará automáticamente (TQ-XXXX).</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="capacidad_total" className="text-foreground">Capacidad Total (L) <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input 
                      id="capacidad_total"
                      name="capacidad_total"
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.capacidad_total}
                      onChange={handleChange}
                      disabled={isAnyLoading}
                      className={`font-technical text-foreground h-11 bg-background ${validationErrors.capacidad_total ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      placeholder="Ej: 5000"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">L</span>
                  </div>
                  {validationErrors.capacidad_total && <p className="text-sm text-destructive mt-1">{validationErrors.capacidad_total}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-foreground">Capacidad Permitida (CA90) - 90%</Label>
                  <div className="h-11 bg-muted/50 rounded-md border flex items-center px-3 font-technical text-foreground/80 cursor-not-allowed">
                    {cp ? cp.toLocaleString() : '0'} L
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-foreground">Dispositivo DRV <span className="text-destructive">*</span></Label>
                  {drvs.loading ? <Skeleton className="h-11 w-full" /> : (
                    <Select disabled={isAnyLoading} value={formData.drv_id} onValueChange={(val) => handleSelectChange('drv_id', val)}>
                      <SelectTrigger className={`h-11 bg-background text-foreground ${validationErrors.drv_id ? 'border-destructive focus:ring-destructive' : ''}`}>
                        <SelectValue placeholder="Seleccione un DRV" />
                      </SelectTrigger>
                      <SelectContent>
                        {drvs.data.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">No hay DRVs activos disponibles</div>
                        ) : (
                          drvs.data.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.marca} {d.modelo} (ID: {d.id})</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {validationErrors.drv_id && <p className="text-sm text-destructive mt-1">{validationErrors.drv_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Origen de Carga <span className="text-destructive">*</span></Label>
                  <Select disabled={isAnyLoading} value={formData.origen_carga} onValueChange={(val) => handleSelectChange('origen_carga', val)}>
                    <SelectTrigger className={`h-11 bg-background text-foreground ${validationErrors.origen_carga ? 'border-destructive focus:ring-destructive' : ''}`}>
                      <SelectValue placeholder="Seleccione el origen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Estacion">Estación (Planta)</SelectItem>
                      <SelectItem value="Autotanque">Autotanque (ATQ)</SelectItem>
                      <SelectItem value="Proveedor">Proveedor Externo</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.origen_carga && <p className="text-sm text-destructive mt-1">{validationErrors.origen_carga}</p>}
                </div>

                {formData.origen_carga === 'Estacion' && (
                  <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-foreground">Estación de Origen <span className="text-destructive">*</span></Label>
                    {estaciones.loading ? <Skeleton className="h-11 w-full" /> : (
                      <Select disabled={isAnyLoading} value={formData.estacion_id} onValueChange={(val) => handleSelectChange('estacion_id', val)}>
                        <SelectTrigger className={`h-11 bg-background text-foreground ${validationErrors.estacion_id ? 'border-destructive focus:ring-destructive' : ''}`}>
                          <SelectValue placeholder="Seleccione la estación" />
                        </SelectTrigger>
                        <SelectContent>
                          {estaciones.data.length === 0 ? (
                             <div className="p-2 text-sm text-muted-foreground">No hay estaciones disponibles</div>
                          ) : (
                            estaciones.data.map(est => (
                              <SelectItem key={est.id} value={est.id}>{est.nombre}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    {validationErrors.estacion_id && <p className="text-sm text-destructive mt-1">{validationErrors.estacion_id}</p>}
                  </div>
                )}

                {formData.origen_carga === 'Autotanque' && (
                  <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-foreground">Autotanque (ATQ) Asociado <span className="text-destructive">*</span></Label>
                    {atqs.loading ? <Skeleton className="h-11 w-full" /> : (
                      <Select disabled={isAnyLoading} value={formData.atq_id} onValueChange={(val) => handleSelectChange('atq_id', val)}>
                        <SelectTrigger className={`h-11 bg-background text-foreground ${validationErrors.atq_id ? 'border-destructive focus:ring-destructive' : ''}`}>
                          <SelectValue placeholder="Seleccione un ATQ" />
                        </SelectTrigger>
                        <SelectContent>
                          {atqs.data.length === 0 ? (
                             <div className="p-2 text-sm text-muted-foreground">No hay autotanques de traspaso disponibles</div>
                          ) : (
                            atqs.data.map(atq => (
                              <SelectItem key={atq.id} value={atq.id}>
                                ATQ {atq.atq_id} - {atq.marca} {atq.modelo} ({atq.anio})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    {validationErrors.atq_id && <p className="text-sm text-destructive mt-1">{validationErrors.atq_id}</p>}
                  </div>
                )}

                {formData.origen_carga === 'Proveedor' && (
                  <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-foreground">Proveedor Asociado <span className="text-destructive">*</span></Label>
                    {proveedores.loading ? <Skeleton className="h-11 w-full" /> : (
                      <Select disabled={isAnyLoading} value={formData.proveedor_id} onValueChange={(val) => handleSelectChange('proveedor_id', val)}>
                        <SelectTrigger className={`h-11 bg-background text-foreground ${validationErrors.proveedor_id ? 'border-destructive focus:ring-destructive' : ''}`}>
                          <SelectValue placeholder="Seleccione proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {proveedores.data.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">No hay proveedores activos disponibles</div>
                          ) : (
                            proveedores.data.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.razon_social}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    {validationErrors.proveedor_id && <p className="text-sm text-destructive mt-1">{validationErrors.proveedor_id}</p>}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="notificacion_activa" 
                    name="notificacion_activa"
                    checked={formData.notificacion_activa}
                    onCheckedChange={(c) => handleSelectChange('notificacion_activa', c)}
                    disabled={isAnyLoading}
                  />
                  <Label htmlFor="notificacion_activa" className={`text-foreground ${isAnyLoading ? 'opacity-50' : 'cursor-pointer'}`}>Activar Notificación de Mantenimiento</Label>
                </div>
                {formData.notificacion_activa && (
                  <div className="space-y-2 max-w-sm pl-7 animate-in fade-in duration-300">
                    <Label className="text-muted-foreground text-xs">Fecha de Próxima Notificación</Label>
                    <Input 
                      type="date" 
                      name="fecha_notificacion"
                      value={formData.fecha_notificacion}
                      onChange={handleChange}
                      disabled={isAnyLoading}
                      className={`h-11 bg-background text-foreground ${validationErrors.fecha_notificacion ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {validationErrors.fecha_notificacion && <p className="text-sm text-destructive mt-1">{validationErrors.fecha_notificacion}</p>}
                  </div>
                )}
              </div>

              <div className="bg-primary/5 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between border border-primary/10 gap-4 mt-6">
                <div>
                  <h4 className="font-semibold text-primary">Resumen Inicial</h4>
                  <p className="text-sm text-primary/80 mt-1">El tanque comenzará con estado <strong>Activo</strong> y 0% de carga disponible.</p>
                </div>
                <Button type="submit" disabled={submitting || isAnyLoading} className="w-full md:w-auto h-12 px-8">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4 mr-2" /> Registrar Tanque</>}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CreateCargaPage;