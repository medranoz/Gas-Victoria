import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, ShieldCheck, DatabaseZap, Search, UploadCloud, Thermometer } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { useTanqueAPI } from '@/hooks/useTanqueAPI.js';
import { useLecturaAPI } from '@/hooks/useLecturaAPI.js';

const CargaDetailPage = () => {
  const { id } = useParams();
  const { getTanque } = useTanqueAPI();
  const { getLastLectura } = useLecturaAPI();
  
  const [tanque, setTanque] = useState(null);
  const [lectura, setLectura] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, l] = await Promise.all([getTanque(id), getLastLectura(id)]);
        setTanque(t);
        setLectura(l);
      } catch (error) {
        console.error("Error loading tank details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, getTanque, getLastLectura]);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Activo': return <Badge className="bg-status-active">Activo</Badge>;
      case 'Desactivado': return <Badge className="bg-status-inactive">Desactivado</Badge>;
      case 'Mantenimiento': return <Badge className="bg-status-mantenimiento">Mantenimiento</Badge>;
      default: return <Badge>{estado}</Badge>;
    }
  };

  const getImageUrl = (record, filename) => {
    if (!record || !filename) return null;
    return pb.files.getUrl(record, filename);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Detalles del Tanque - Gas Victoria</title></Helmet>
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <Button variant="ghost" asChild className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <Link to="/carga"><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Control de Carga</Link>
        </Button>

        {loading || !tanque ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-2xl p-6 md:p-10 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl font-extrabold text-foreground font-technical">{tanque.numero_tanque}</h1>
                  {getStatusBadge(tanque.estado)}
                </div>
                <p className="text-muted-foreground flex items-center gap-2 mt-2">
                  Origen: <span className="font-semibold text-foreground">{tanque.origen_carga}</span>
                  <span className="text-border">|</span>
                  Entidad: <span className="font-medium text-foreground">
                    {tanque.origen_carga === 'Proveedor' ? tanque.expand?.proveedor_id?.razon_social : tanque.expand?.estacion_id?.nombre}
                  </span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="h-11">
                  <Link to={`/carga/lectura/${tanque.id}`}><UploadCloud className="w-4 h-4 mr-2" /> Registrar Lectura</Link>
                </Button>
                <Button asChild className="h-11 bg-primary text-primary-foreground">
                  <Link to={`/carga/cortes/${tanque.id}`}><DatabaseZap className="w-4 h-4 mr-2" /> Gestionar Cortes</Link>
                </Button>
                <Button asChild variant="secondary" className="h-11">
                  <Link to={`/carga/historial/${tanque.id}`}><Search className="w-4 h-4 mr-2" /> Ver Historial</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Información General */}
              <Card className="rounded-2xl shadow-sm border">
                <CardHeader className="bg-muted/10 border-b pb-4">
                  <CardTitle className="text-xl">Capacidad y Estado Volumétrico</CardTitle>
                  <CardDescription>Resumen de las métricas principales del tanque.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Capacidad Total (CT)</p>
                      <p className="text-2xl font-bold font-technical text-foreground">{tanque.capacidad_total?.toLocaleString()} L</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Capacidad Permitida (CP)</p>
                      <p className="text-2xl font-bold font-technical text-foreground">{tanque.capacidad_permitida?.toLocaleString()} L</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Carga Disponible</p>
                      <p className="text-3xl font-black font-technical text-primary">
                        {tanque.carga_disponible_litros?.toLocaleString()} L
                        <span className="text-lg font-medium text-muted-foreground ml-2">({tanque.carga_disponible_inicial}%)</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Carga Faltante</p>
                      <p className="text-3xl font-black font-technical text-destructive/90">
                        {tanque.carga_faltante?.toLocaleString()} L
                      </p>
                    </div>
                    <div className="col-span-2 pt-4 border-t">
                      <p className="text-sm font-medium text-muted-foreground mb-1">DRV Asociado</p>
                      <p className="text-lg font-medium text-foreground">
                        {tanque.expand?.drv_id ? `${tanque.expand.drv_id.marca} ${tanque.expand.drv_id.modelo} (${tanque.expand.drv_id.id})` : 'No asignado'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Panel Lectura A */}
              <Card className="rounded-2xl shadow-sm border bg-primary/5 border-primary/20">
                <CardHeader className="bg-background/50 border-b border-primary/10 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-primary font-bold">Última Lectura (Lectura A)</CardTitle>
                      <CardDescription>
                        {lectura ? new Date(lectura.created).toLocaleString() : 'No hay lecturas registradas.'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary bg-background font-semibold">LECTURA A</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {lectura ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                          <p className="text-xs text-muted-foreground mb-1">Carga Disp. (%)</p>
                          <p className="text-xl font-bold font-technical text-foreground">{lectura.carga_disponible_porcentaje}%</p>
                        </div>
                        <div className="bg-background rounded-xl p-4 border border-border shadow-sm flex items-center gap-3">
                          <Thermometer className="w-8 h-8 text-secondary" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Temperatura</p>
                            <p className="text-xl font-bold font-technical text-foreground">{lectura.temperatura}°C</p>
                          </div>
                        </div>
                      </div>
                      
                      {lectura.imagen_evidencia && (
                        <div className="rounded-xl overflow-hidden border border-border bg-background">
                          <a href={getImageUrl(lectura, lectura.imagen_evidencia)} target="_blank" rel="noreferrer" className="block relative group">
                            <img 
                              src={getImageUrl(lectura, lectura.imagen_evidencia)} 
                              alt="Evidencia Lectura A" 
                              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Click para ampliar</span>
                            </div>
                          </a>
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Usuario: <span className="font-medium text-foreground">{lectura.expand?.usuario_lectura?.email}</span></p>
                        {lectura.observaciones && (
                          <p className="text-muted-foreground mt-2 italic border-l-2 border-primary/30 pl-3">"{lectura.observaciones}"</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <UploadCloud className="w-12 h-12 text-primary/20 mb-3" />
                      <p className="text-muted-foreground mb-4">Aún no se ha registrado ninguna Lectura A para este tanque.</p>
                      <Button asChild size="sm" variant="outline" className="border-primary/50 text-primary">
                        <Link to={`/carga/lectura/${tanque.id}`}>Registrar Ahora</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CargaDetailPage;