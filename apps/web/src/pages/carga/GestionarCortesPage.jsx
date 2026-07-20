import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Save, Loader2, DatabaseZap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert.jsx';

import { useTanqueAPI } from '@/hooks/useTanqueAPI.js';
import { useLecturaAPI } from '@/hooks/useLecturaAPI.js';
import { useCorteAPI } from '@/hooks/useCorteAPI.js';
import { calcularCargaDisponibleLitros, calcularCargaFaltante, validarAutorizacionCarga, validarTemperatura } from '@/hooks/useTanqueCalculations.js';

const GestionarCortesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTanque, updateTanque } = useTanqueAPI();
  const { getLastLectura } = useLecturaAPI();
  const { getLastDRVCorte, createCorte } = useCorteAPI();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [tanque, setTanque] = useState(null);
  const [lecturaA, setLecturaA] = useState(null);
  const [lastDrvCorte, setLastDrvCorte] = useState(null);

  const [formData, setFormData] = useState({
    tipo_autorizacion: 'Porcentaje',
    valor_autorizacion: '',
    temperatura_final: '',
    observaciones: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const t = await getTanque(id);
        setTanque(t);
        const l = await getLastLectura(id);
        setLecturaA(l);
        if (t.drv_id) {
          const dc = await getLastDRVCorte(t.drv_id);
          setLastDrvCorte(dc);
        }
      } catch (e) {
        toast.error('Error cargando dependencias de corte.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, getTanque, getLastLectura, getLastDRVCorte]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  // Calculations
  const cp = tanque?.capacidad_permitida || 0;
  const ciPorcentaje = lecturaA?.carga_disponible_porcentaje ?? tanque?.carga_disponible_inicial ?? 0;
  const valorNum = Number(formData.valor_autorizacion) || 0;

  // Compute final estimations based on authorization
  let cfPorcentaje = ciPorcentaje;
  if (formData.tipo_autorizacion === 'Porcentaje') {
    cfPorcentaje += valorNum;
  } else if (formData.tipo_autorizacion === 'Litros' && cp > 0) {
    cfPorcentaje += (valorNum / cp) * 100;
  }
  
  const cdlFinal = calcularCargaDisponibleLitros(cp, cfPorcentaje);
  const cfFinal = calcularCargaFaltante(cp, cdlFinal);

  const isValid = validarAutorizacionCarga(formData.tipo_autorizacion, valorNum, ciPorcentaje, cp);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tanque || !lecturaA) {
      toast.error('Falta información inicial (Lectura A) del tanque.'); return;
    }
    if (!isValid) {
      toast.error('El valor de autorización excede la capacidad permitida.'); return;
    }
    if (!validarTemperatura(formData.temperatura_final)) {
      toast.error('Temperatura final inválida (-10 a 60).'); return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tanque_id: tanque.id,
        drv_id: tanque.drv_id,
        ultimo_corte_drv: lastDrvCorte ? lastDrvCorte.corte : 0,
        autorizacion_carga_tipo: formData.tipo_autorizacion,
        autorizacion_carga_valor: valorNum,
        carga_inicial_porcentaje: ciPorcentaje,
        carga_final_porcentaje: cfPorcentaje,
        carga_disponible_litros_final: cdlFinal,
        carga_faltante_final: cfFinal,
        temperatura_final: Number(formData.temperatura_final),
        estado_corte: 'Autorizado',
        observaciones: formData.observaciones
      };

      // useCorteAPI will automatically capture Lectura B
      await createCorte(payload, file);

      // Update Tank to reflect new capacity
      await updateTanque(tanque.id, {
        carga_disponible_inicial: cfPorcentaje,
        carga_disponible_litros: cdlFinal,
        carga_faltante: cfFinal,
        temperatura: Number(formData.temperatura_final)
      });

      toast.success('Corte autorizado, Lectura B capturada y tanque actualizado.');
      navigate(`/carga/detalle/${tanque.id}`);
    } catch (e) {
      console.error(e);
      toast.error('Error al registrar corte.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Gestionar Cortes - Gas Victoria</title></Helmet>
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 md:py-16">
        <Button variant="ghost" asChild className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <Link to={`/carga/detalle/${id}`}><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Detalles</Link>
        </Button>

        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
            <DatabaseZap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Gestión de Corte / Autorización</h1>
            <p className="text-muted-foreground mt-1">Registra la descarga y autoriza el nuevo nivel volumétrico (Lectura B).</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : !lecturaA ? (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Falta Lectura A</AlertTitle>
            <AlertDescription>
              Para gestionar un corte, el tanque debe tener registrada una "Lectura A" reciente.
              <br/>
              <Button variant="link" asChild className="p-0 h-auto text-destructive-foreground mt-2 font-bold underline">
                <Link to={`/carga/lectura/${id}`}>Ir a registrar Lectura A</Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              <Card className="border shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-card border-b bg-muted/10 pb-4">
                  <CardTitle className="text-xl">Formulario de Autorización (Lectura B)</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-foreground">Tipo de Autorización <span className="text-destructive">*</span></Label>
                        <Select value={formData.tipo_autorizacion} onValueChange={v => setFormData(p => ({...p, tipo_autorizacion: v}))}>
                          <SelectTrigger className="h-11 bg-background text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Porcentaje">Porcentaje (%)</SelectItem>
                            <SelectItem value="Litros">Litros (L)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Valor a Cargar <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Input 
                            name="valor_autorizacion"
                            type="number"
                            min="0.1"
                            step="0.01"
                            value={formData.valor_autorizacion}
                            onChange={handleChange}
                            className="font-technical text-foreground h-11 bg-background"
                            required
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            {formData.tipo_autorizacion === 'Porcentaje' ? '%' : 'L'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-foreground">Temperatura Final (°C) <span className="text-destructive">*</span></Label>
                        <Input 
                          name="temperatura_final"
                          type="number"
                          min="-10" max="60" step="0.1"
                          value={formData.temperatura_final}
                          onChange={handleChange}
                          className="font-technical text-foreground h-11 bg-background"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Imagen Lectura B (Opcional)</Label>
                        <Input 
                          type="file" 
                          accept="image/jpeg,image/png"
                          onChange={handleFileChange}
                          className="h-11 bg-background file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-foreground">Observaciones (Opcional)</Label>
                        <Input 
                          name="observaciones"
                          value={formData.observaciones}
                          onChange={handleChange}
                          className="h-11 bg-background"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                      <Button type="submit" disabled={submitting || !isValid || !valorNum} className="h-11 px-8 w-full sm:w-auto">
                        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Autorizando...</> : <><Save className="w-4 h-4 mr-2" /> Autorizar Carga y Guardar</>}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Panel de Resumen Lateral */}
            <div className="space-y-6">
              <Card className="rounded-2xl border shadow-sm bg-muted/20">
                <CardHeader className="pb-3 border-b border-border/50 bg-background/50">
                  <CardTitle className="text-lg">Estado Proyectado</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Carga Inicial (Lectura A)</p>
                    <p className="text-xl font-bold font-technical">{ciPorcentaje.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Carga Final (Proyectada)</p>
                    <p className={`text-2xl font-black font-technical ${cfPorcentaje > 100 ? 'text-destructive' : 'text-primary'}`}>
                      {cfPorcentaje.toFixed(2)}%
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Volumen Final Calculado</p>
                    <p className="text-lg font-bold font-technical text-foreground">{cdlFinal.toLocaleString()} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Faltante Calculado</p>
                    <p className="text-lg font-bold font-technical text-destructive/80">{cfFinal.toLocaleString()} L</p>
                  </div>
                  {!isValid && valorNum > 0 && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
                      La carga solicitada excede la capacidad permitida (90%).
                    </div>
                  )}
                </CardContent>
              </Card>

              {lastDrvCorte && (
                <Card className="rounded-2xl border shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm">Último Corte DRV</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="font-technical text-lg font-bold">{lastDrvCorte.corte.toLocaleString()} L</p>
                    <p className="text-xs text-muted-foreground mt-1">Fecha: {new Date(lastDrvCorte.created).toLocaleString()}</p>
                  </CardContent>
                </Card>
              )}
            </div>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GestionarCortesPage;