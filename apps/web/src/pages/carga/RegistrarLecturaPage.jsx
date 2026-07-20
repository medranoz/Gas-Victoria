import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Save, Loader2, Thermometer, DatabaseZap } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';

import { useTanqueAPI } from '@/hooks/useTanqueAPI.js';
import { useLecturaAPI } from '@/hooks/useLecturaAPI.js';
import { calcularCargaDisponibleLitros, calcularCargaFaltante, validarTemperatura } from '@/hooks/useTanqueCalculations.js';

const RegistrarLecturaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTanque, updateTanque } = useTanqueAPI();
  const { createLectura } = useLecturaAPI();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tanque, setTanque] = useState(null);

  const [formData, setFormData] = useState({
    carga_disponible_porcentaje: '',
    temperatura: '',
    observaciones: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchTanque = async () => {
      try {
        const data = await getTanque(id);
        setTanque(data);
      } catch (e) {
        toast.error('No se pudo cargar la información del tanque.');
        navigate('/carga');
      } finally {
        setLoading(false);
      }
    };
    fetchTanque();
  }, [id, getTanque, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const cdPorcentaje = Number(formData.carga_disponible_porcentaje) || 0;
  const cp = tanque?.capacidad_permitida || 0;

  const cdl = useMemo(() => calcularCargaDisponibleLitros(cp, cdPorcentaje), [cp, cdPorcentaje]);
  const cf = useMemo(() => calcularCargaFaltante(cp, cdl), [cp, cdl]);

  const isValid = cdPorcentaje >= 0 && cdPorcentaje <= 100 && validarTemperatura(formData.temperatura);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      toast.error('Verifica los valores ingresados. Porcentaje (0-100) y Temp (-10 a 60).'); return;
    }
    
    setSubmitting(true);
    try {
      const payloadLectura = {
        tipo_lectura: 'Lectura A',
        carga_disponible_porcentaje: cdPorcentaje,
        carga_disponible_litros: cdl,
        carga_faltante: cf,
        temperatura: Number(formData.temperatura),
        observaciones: formData.observaciones
      };

      await createLectura(tanque.id, payloadLectura, file);

      // Actualizar el estado central del tanque
      await updateTanque(tanque.id, {
        carga_disponible_inicial: cdPorcentaje,
        carga_disponible_litros: cdl,
        carga_faltante: cf,
        temperatura: Number(formData.temperatura)
      }, file);

      toast.success('Lectura A registrada correctamente.');
      navigate(`/carga/detalle/${tanque.id}`);
    } catch (e) {
      console.error(e);
      toast.error('Ocurrió un error al registrar la lectura.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Registrar Lectura A - Gas Victoria</title></Helmet>
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Button variant="ghost" asChild className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <Link to={`/carga/detalle/${id}`}><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Detalles</Link>
        </Button>

        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
            <Thermometer className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Registrar Lectura A</h1>
            <p className="text-muted-foreground mt-1">Ingresa el nivel volumétrico inicial antes de iniciar un proceso de carga.</p>
          </div>
        </div>

        <Card className="border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-card border-b bg-muted/10">
            <CardTitle className="text-xl">Datos Volumétricos</CardTitle>
            <CardDescription>
              Tanque <strong>{tanque?.numero_tanque}</strong> • Capacidad Permitida: <strong>{cp.toLocaleString()} L</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {loading || !tanque ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-foreground">Carga Disponible (%) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Input 
                        name="carga_disponible_porcentaje"
                        type="number"
                        min="0" max="100" step="0.01"
                        value={formData.carga_disponible_porcentaje}
                        onChange={handleChange}
                        className="font-technical text-foreground h-11 bg-background"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Temperatura (°C) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Input 
                        name="temperatura"
                        type="number"
                        min="-10" max="60" step="0.1"
                        value={formData.temperatura}
                        onChange={handleChange}
                        className="font-technical text-foreground h-11 bg-background"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">°C</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div>
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Volumen Calculado</p>
                    <p className="text-2xl font-technical font-bold text-primary">{cdl.toLocaleString()} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-destructive/80 font-semibold uppercase tracking-wider mb-1">Faltante</p>
                    <p className="text-2xl font-technical font-bold text-destructive">{cf.toLocaleString()} L</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <div className="space-y-2">
                    <Label className="text-foreground">Imagen de Evidencia (Lectura A) <span className="text-destructive">*</span></Label>
                    <Input 
                      type="file" 
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="h-11 bg-background file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Observaciones (Opcional)</Label>
                    <Input 
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      className="h-11 bg-background"
                      placeholder="Alguna anomalía visual..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => navigate(`/carga/detalle/${id}`)} className="h-11 px-6">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting || !isValid} className="h-11 px-8">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registrando...</> : <><Save className="w-4 h-4 mr-2" /> Guardar Lectura A</>}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RegistrarLecturaPage;