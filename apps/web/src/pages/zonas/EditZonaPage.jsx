import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

import { useZonas } from '@/hooks/useZonas.js';

const EditZonaPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getZona, updateZona } = useZonas();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const record = await getZona(id);
        setFormData({
          nombre: record.nombre || '',
          descripcion: record.descripcion || ''
        });
      } catch (err) {
        setError('No se pudo encontrar la zona especificada. Es posible que haya sido eliminada.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id, getZona]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la zona es obligatorio.';
    }
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await updateZona(id, formData);
      toast.success('Zona actualizada exitosamente');
      navigate('/zonas');
    } catch (err) {
      toast.error('Ocurrió un error al actualizar. Verifica los datos.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 md:py-16">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="mb-8 flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Card className="border shadow-sm rounded-2xl">
            <CardContent className="p-8 space-y-6">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Zona no encontrada</h2>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button asChild><Link to="/zonas">Volver al Catálogo</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Editar Zona - Gas Victoria</title></Helmet>
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 md:py-16">
        <Button variant="ghost" asChild className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <Link to="/zonas"><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Zonas</Link>
        </Button>

        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 border border-blue-500/20">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Editar Zona</h1>
            <p className="text-muted-foreground mt-1">Actualiza los detalles de la ruta de distribución.</p>
          </div>
        </div>

        <Card className="border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-card border-b bg-muted/10">
            <CardTitle className="text-xl">Datos de la Zona</CardTitle>
            <CardDescription>Actualiza el nombre y descripción asignados a este registro.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-foreground">Nombre de la Zona / Ruta <span className="text-destructive">*</span></Label>
                <Input 
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`h-11 bg-background text-foreground ${validationErrors.nombre ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {validationErrors.nombre && <p className="text-sm text-destructive mt-1">{validationErrors.nombre}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-foreground">Descripción detallada</Label>
                <Textarea 
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  disabled={submitting}
                  className="min-h-[120px] bg-background text-foreground resize-y"
                />
              </div>

              <div className="pt-6 border-t flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/zonas')} disabled={submitting} className="h-11 px-6">
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="h-11 px-8">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>}
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

export default EditZonaPage;