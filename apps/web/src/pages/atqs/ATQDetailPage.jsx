import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useATQs } from '@/hooks/useATQs.js';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx';
import { ArrowLeft, Truck, Edit, CalendarClock, ShieldCheck, Trash2, BellRing, Info } from 'lucide-react';

const ATQDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getATQById, deleteATQ, isLoading } = useATQs();
  const [atq, setAtq] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const res = await getATQById(id);
      if (res.success) {
        setAtq(res.data);
      } else {
        navigate('/atqs');
      }
    };
    loadData();
  }, [id, getATQById, navigate]);

  const handleDelete = async () => {
    const res = await deleteATQ(id);
    if (res.success) {
      navigate('/atqs');
    }
  };

  if (!atq && isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/10">
        <Header />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Card>
            <CardContent className="p-8">
              <Skeleton className="h-10 w-1/3 mb-6" />
              <Skeleton className="h-40 w-full mb-6" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!atq) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Helmet>
        <title>{atq.atq_id} Detalle - Gas Victoria</title>
      </Helmet>

      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Button variant="ghost" onClick={() => navigate('/atqs')} className="mb-6 pl-0 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Catálogo
        </Button>

        <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-primary/10 rounded-xl text-primary hidden sm:block">
              <Truck className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{atq.atq_id}</h1>
                <Badge className="font-mono text-sm tracking-wider px-2 py-0.5">{atq.placa}</Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="font-medium text-foreground">{atq.marca} {atq.modelo}</span> ({atq.anio})
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Badge variant={atq.activo ? 'default' : 'secondary'} className={atq.activo ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}>
                  {atq.activo ? 'Operativo' : 'Desactivado'}
                </Badge>
                <Badge variant="outline" className={atq.rol_tanque === 'DE TRASPASO' ? 'border-primary/30 text-primary' : 'border-secondary/30 text-secondary-foreground'}>
                  {atq.rol_tanque}
                </Badge>
                <Badge variant="outline">
                  Estado Físico: {atq.estado_actual}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0">
            <Link to={`/atqs/editar/${atq.id}`}>
              <Button className="w-full justify-start">
                <Edit className="w-4 h-4 mr-2" /> Editar ATQ
              </Button>
            </Link>
            {atq.activo && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" /> Desactivar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Desactivar {atq.atq_id}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción marcará el autotanque como inactivo. Podrás reactivarlo más tarde si es necesario.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Desactivar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-muted-foreground" /> 
                Datos Regulatorios y Contables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ID CRE</p>
                  <p className="font-medium text-foreground">{atq.id_cre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Registro Contable</p>
                  <p className="font-medium text-foreground font-mono bg-muted/50 p-1 w-fit rounded">{atq.registro_contable}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">NIV (Número de Identificación Vehicular)</p>
                  <p className="font-mono text-sm tracking-widest text-foreground bg-muted p-2 rounded-md border border-border/50">{atq.niv}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-muted-foreground" /> 
                Mantenimiento Programado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {atq.fecha_mantenimiento ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Próxima Fecha de Mantenimiento</p>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-lg text-foreground">
                        {new Date(atq.fecha_mantenimiento).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Badge variant="outline" className={`flex w-fit items-center gap-1.5 px-3 py-1 ${atq.notificacion_mantenimiento ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-muted text-muted-foreground border-muted-foreground/20'}`}>
                      {atq.notificacion_mantenimiento ? <BellRing className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                      {atq.notificacion_mantenimiento ? 'Notificaciones automáticas activadas' : 'Notificaciones desactivadas'}
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                  <CalendarClock className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-muted-foreground">Sin mantenimiento programado</p>
                  <Link to={`/atqs/editar/${atq.id}`} className="mt-3 text-sm text-primary hover:underline">
                    Programar ahora
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {atq.observaciones && (
            <Card className="col-span-1 md:col-span-2 border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-muted-foreground" /> 
                  Observaciones Adicionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border border-border/50">
                  {atq.observaciones}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="col-span-1 md:col-span-2 flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
            <p>Creado el {new Date(atq.created).toLocaleDateString()} por {atq.expand?.created_by?.email || 'Sistema'}</p>
            <p>Última actualización: {new Date(atq.updated).toLocaleDateString()}</p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ATQDetailPage;