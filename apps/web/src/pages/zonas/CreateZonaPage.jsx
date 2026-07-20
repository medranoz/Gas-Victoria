import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Map } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';

import { useZonas } from '@/hooks/useZonas.js';

const CreateZonaPage = () => {
  const navigate = useNavigate();
  const { createZona } = useZonas();
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la zona es obligatorio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createZona(formData);
      toast.success('Zona creada exitosamente');
      navigate('/zonas');
    } catch (err) {
      toast.error('Ocurrió un error al crear la zona. Verifica los datos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Nueva Zona - Gas Victoria</title></Helmet>
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 md:py-16">
        <Button variant="ghost" asChild className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <Link to="/zonas"><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Zonas</Link>
        </Button>

        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
            <Map className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Nueva Zona</h1>
            <p className="text-muted-foreground mt-1">Registra una nueva ruta o zona de distribución.</p>
          </div>
        </div>

        <Card className="border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-card border-b bg-muted/10">
            <CardTitle className="text-xl">Información de la Zona</CardTitle>
            <CardDescription>Completa los datos identificativos. Los campos marcados con * son obligatorios.</CardDescription>
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
                  className={`h-11 bg-background text-foreground ${errors.nombre ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder="Ej: Zona Norte 01"
                />
                {errors.nombre && <p className="text-sm text-destructive mt-1">{errors.nombre}</p>}
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
                  placeholder="Describe la cobertura, colonias o referencias de esta zona..."
                />
              </div>

              {/* Note about missing db fields included organically as UI context */}
              <div className="bg-secondary/20 p-4 rounded-lg border border-secondary/30 mt-6">
                <p className="text-sm text-secondary-foreground">
                  <strong>Nota del sistema:</strong> Esta zona quedará activa por defecto tras su creación. Podrás asociarle costos operativos desde el panel de tarifas.
                </p>
              </div>

              <div className="pt-6 border-t flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/zonas')} disabled={submitting} className="h-11 px-6">
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="h-11 px-8">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4 mr-2" /> Crear Zona</>}
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

export default CreateZonaPage;