import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building, Calendar, Mail, MapPin, Phone, Pencil, FileText, AlertCircle, Hash, CheckCircle2, XCircle } from 'lucide-react';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

import { useProveedores } from '@/hooks/useProveedores.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ProveedorDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getProveedorById } = useProveedores();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proveedor, setProveedor] = useState(null);

  const canModify = currentUser?.role === 'Superadmin' || currentUser?.role === 'Administrador';

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await getProveedorById(id);
        if (res.success && res.data) {
            setProveedor(res.data);
        } else {
            setError('No se pudo cargar la información del proveedor.');
        }
      } catch (err) {
        setError('No se pudo encontrar el registro. Es posible que haya sido eliminado.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id, getProveedorById]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Card className="border shadow-sm rounded-2xl p-8 space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !proveedor) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Registro no encontrado</h2>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button asChild><Link to="/proveedores">Volver al Catálogo</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Detalle de Proveedor: {proveedor.razon_social} - Gas Victoria</title></Helmet>
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Button variant="ghost" asChild className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <Link to="/proveedores"><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Proveedores</Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20 mt-1">
              <Building className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight break-words">{proveedor.razon_social}</h1>
                  {proveedor.estado === 'Activo' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Activo
                      </span>
                  ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                          <XCircle className="w-3 h-3 mr-1" /> Inactivo
                      </span>
                  )}
              </div>
              <p className="text-muted-foreground flex items-center text-sm md:text-base font-mono">
                <Hash className="w-4 h-4 mr-1.5" /> {proveedor.codigo_proveedor}
              </p>
            </div>
          </div>
          {canModify && (
            <Button asChild variant="outline" className="shrink-0 h-11 px-6 rounded-xl border-primary/20 hover:bg-primary/5 text-primary hover:text-primary">
              <Link to={`/proveedores/editar/${proveedor.id}`}><Pencil className="w-4 h-4 mr-2" /> Editar Proveedor</Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/10 border-b pb-4">
              <CardTitle className="text-lg flex items-center"><FileText className="w-5 h-5 mr-2 text-primary" /> Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center"><Mail className="w-4 h-4 mr-1.5" /> Correo Electrónico</h3>
                    <p className="text-foreground font-medium">{proveedor.email || <span className="opacity-50 italic">No registrado</span>}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center"><Phone className="w-4 h-4 mr-1.5" /> Teléfono</h3>
                    <p className="text-foreground font-medium">{proveedor.telefono || <span className="opacity-50 italic">No registrado</span>}</p>
                  </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> Dirección Fiscal</h3>
                <p className="text-foreground leading-relaxed">{proveedor.direccion || <span className="opacity-50 italic">No registrada</span>}</p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observaciones</h3>
                {proveedor.observaciones ? (
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{proveedor.observaciones}</p>
                ) : (
                  <p className="text-muted-foreground italic bg-muted/50 p-4 rounded-lg border border-dashed">Sin observaciones registradas.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border shadow-sm rounded-2xl bg-card">
              <CardHeader className="bg-muted/10 border-b pb-4">
                <CardTitle className="text-lg">Metadatos</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4 mr-2" /> Fecha de Registro
                  </div>
                  <p className="text-foreground font-medium pl-6">{new Date(proveedor.created).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4 mr-2" /> Última Actualización
                  </div>
                  <p className="text-foreground font-medium pl-6">{new Date(proveedor.updated).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground tracking-wider mb-1">ID DEL REGISTRO</div>
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground/80 break-all">{proveedor.id}</code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProveedorDetailPage;