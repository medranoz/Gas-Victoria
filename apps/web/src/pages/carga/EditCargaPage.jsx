import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Save, Loader2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';

import { useTanqueAPI } from '@/hooks/useTanqueAPI.js';

const EditCargaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTanque, updateTanque } = useTanqueAPI();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tanque, setTanque] = useState(null);

  const [formData, setFormData] = useState({
    estado: '',
    notificacion_activa: false,
    fecha_notificacion: ''
  });

  useEffect(() => {
    const fetchTanque = async () => {
      try {
        const data = await getTanque(id);
        setTanque(data);
        setFormData({
          estado: data.estado,
          notificacion_activa: data.notificacion_activa,
          fecha_notificacion: data.fecha_notificacion ? new Date(data.fecha_notificacion).toISOString().split('T')[0] : ''
        });
      } catch (e) {
        toast.error('No se pudo cargar el tanque.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.notificacion_activa && !formData.fecha_notificacion) {
      toast.error('Selecciona fecha de notificación.'); return;
    }

    setSubmitting(true);
    try {
      const payload = {
        estado: formData.estado,
        notificacion_activa: formData.notificacion_activa,
        fecha_notificacion: formData.notificacion_activa && formData.fecha_notificacion 
          ? new Date(formData.fecha_notificacion).toISOString() 
          : null
      };
      await updateTanque(id, payload);
      toast.success(`Tanque actualizado correctamente.`);
      navigate('/carga');
    } catch (e) {
      console.error(e);
      toast.error('Error al actualizar el tanque.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Editar Tanque - Gas Victoria</title></Helmet>
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Button variant="ghost" asChild className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <Link to="/carga"><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Control de Carga</Link>
        </Button>

        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-secondary/10 rounded-xl text-secondary border border-secondary/20">
            <Settings2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Editar Configuración</h1>
            <p className="text-muted-foreground mt-1">Ajusta el estado y notificaciones del tanque de carga.</p>
          </div>
        </div>

        <Card className="border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-card border-b bg-muted/10">
            <CardTitle className="text-xl">Datos del Tanque</CardTitle>
            <CardDescription>Capacidades y valores calculados son de solo lectura.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {loading || !tanque ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Resumen Lectura Oculto/Deshabilitado */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Número</p>
                    <p className="font-technical font-medium text-foreground">{tanque.numero_tanque}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cap. Total</p>
                    <p className="font-technical font-medium text-foreground">{tanque.capacidad_total?.toLocaleString()} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Carga Disp.</p>
                    <p className="font-technical font-medium text-primary">{tanque.carga_disponible_litros?.toLocaleString()} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Carga Faltante</p>
                    <p className="font-technical font-medium text-destructive">{tanque.carga_faltante?.toLocaleString()} L</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Estado del Tanque <span className="text-destructive">*</span></Label>
                    <Select value={formData.estado} onValueChange={(v) => setFormData(p => ({...p, estado: v}))} required>
                      <SelectTrigger className="h-11 bg-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Desactivado">Desactivado</SelectItem>
                        <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id="notificacion_activa" 
                      checked={formData.notificacion_activa}
                      onCheckedChange={(c) => setFormData(p => ({...p, notificacion_activa: c}))}
                    />
                    <Label htmlFor="notificacion_activa" className="text-foreground cursor-pointer">Activar Notificación de Mantenimiento</Label>
                  </div>
                  {formData.notificacion_activa && (
                    <div className="space-y-2 max-w-sm pl-7">
                      <Label className="text-muted-foreground text-xs">Fecha de Próxima Notificación</Label>
                      <Input 
                        type="date" 
                        name="fecha_notificacion"
                        value={formData.fecha_notificacion}
                        onChange={handleChange}
                        className="h-11 bg-background text-foreground"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => navigate('/carga')} className="h-11 px-6">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting} className="h-11 px-8">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>}
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

export default EditCargaPage;