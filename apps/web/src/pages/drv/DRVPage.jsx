import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { ArrowRight, Fuel, Plus, History, Activity, DatabaseZap, Eye, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog.jsx";
import { toast } from 'sonner';

const DRVPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDRVs: 0,
    activeDRVs: 0,
    totalCuts: 0,
    recentCuts: []
  });
  const [drvs, setDrvs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDrvForDelete, setSelectedDrvForDelete] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [drvList, cutsList] = await Promise.all([
        pb.collection('drv').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('drv_cortes').getList(1, 5, { 
          sort: '-fecha_hora_vf',
          expand: 'drv_id',
          $autoCancel: false 
        })
      ]);

      setDrvs(drvList);
      setStats({
        totalDRVs: drvList.length,
        activeDRVs: drvList.filter(d => d.estado === 'activo').length,
        totalCuts: cutsList.totalItems,
        recentCuts: cutsList.items
      });
    } catch (err) {
      console.error("Error fetching DRV data:", err);
      toast.error("Error al cargar la información de DRVs. Intentando reconectar...");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    let isSubscribed = false;
    const subscribeToUpdates = async () => {
      try {
        await pb.collection('drv').subscribe('*', () => {
          fetchDashboardData();
        });
        isSubscribed = true;
      } catch (err) {
        console.error("Subscription error:", err);
      }
    };
    
    if (pb.authStore.isValid) {
      subscribeToUpdates();
    }

    return () => {
      if (isSubscribed) pb.collection('drv').unsubscribe('*').catch(console.error);
    };
  }, []);

  const confirmDelete = (drv) => {
    setSelectedDrvForDelete(drv);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!selectedDrvForDelete) return;
    setIsDeleting(true);
    try {
      await pb.collection('drv').delete(selectedDrvForDelete.id, { $autoCancel: false });
      toast.success('Dispositivo DRV eliminado exitosamente.');
      setDeleteModalOpen(false);
      setSelectedDrvForDelete(null);
      // Let the realtime subscription trigger fetchDashboardData, or fallback call it
      await fetchDashboardData();
    } catch (error) {
      console.error("Error deleting DRV:", error);
      toast.error('No se pudo eliminar el dispositivo. Puede que tenga cortes o relaciones dependientes.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Helmet>
        <title>Gestión de DRV - Gas Victoria</title>
      </Helmet>

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
        <div className="relative z-10 space-y-12">
          
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4" style={{letterSpacing: '-0.02em'}}>
              Gestión de Descargas<br />
              <span className="text-primary/90">y DRV</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[65ch]">
              Administra los Dispositivos de Registro Volumétrico. Crea nuevos equipos, registra cortes diarios y gestiona la estructura de medición.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Primary Action Card */}
            <div className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-card border border-border shadow-md p-8 lg:p-12 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
              <div className="relative z-10 h-full flex flex-col items-start">
                <div className="p-3 bg-primary/10 rounded-xl mb-6 text-primary border border-primary/20">
                  <DatabaseZap className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Registrar Corte</h2>
                <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
                  Ingresa los valores iniciales y finales para calcular volumétricos precisos. La actualización del DRV se aplicará instantáneamente.
                </p>
                <div className="mt-auto">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 transition-transform rounded-xl px-8 h-14 text-lg shadow-sm">
                    <Link to="/descarga/cortes">
                      Iniciar Proceso de Corte <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Action: New DRV */}
            <Link to="/descarga/nuevo-drv" className="group rounded-3xl bg-card border border-border p-8 hover:bg-muted/50 transition-colors flex flex-col items-start justify-between h-full shadow-sm">
              <div className="p-3 bg-muted rounded-xl text-foreground group-hover:text-primary transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Nuevo Equipo</h3>
                <p className="text-sm text-muted-foreground">Da de alta un nuevo dispositivo de registro volumétrico.</p>
              </div>
            </Link>

            {/* Stats Cards */}
            <div className="rounded-3xl bg-card border border-border p-8 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-muted-foreground font-medium text-sm tracking-wide uppercase">Equipos Activos</h3>
                <Fuel className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-5xl font-bold text-foreground font-variant-numeric tabular-nums">
                {isLoading ? '-' : stats.activeDRVs}
                <span className="text-xl text-muted-foreground ml-2 font-medium">/ {isLoading ? '-' : stats.totalDRVs}</span>
              </div>
            </div>

            <Link to="/descarga/historial" className="md:col-span-2 rounded-3xl bg-card border border-border p-8 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl text-secondary shrink-0">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">Historial de Cortes</h3>
                  <p className="text-sm text-muted-foreground">Ver todos los registros y exportar datos a Excel.</p>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end">
                <span className="text-3xl font-bold text-foreground font-variant-numeric tabular-nums">{isLoading ? '-' : stats.totalCuts}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Cortes Totales</span>
              </div>
            </Link>
          </div>

          {/* List of DRVs (Admin CRUD Table) */}
          <div className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-2xl font-bold text-foreground">Lista de Equipos DRV</h3>
              </div>
              <Button asChild variant="outline" className="hidden sm:flex">
                <Link to="/descarga/nuevo-drv">
                  <Plus className="w-4 h-4 mr-2" /> Agregar Dispositivo
                </Link>
              </Button>
            </div>

            <div className="border border-border rounded-2xl bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Marca / Modelo</TableHead>
                    <TableHead>Identificador</TableHead>
                    <TableHead className="text-right">VI Actual (L)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : drvs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="flex flex-col items-center py-12 text-muted-foreground">
                          <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                          <p>No se han registrado dispositivos DRV.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    drvs.map(drv => (
                      <TableRow key={drv.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          {drv.marca}
                          <span className="block text-xs text-muted-foreground font-normal">{drv.modelo}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {drv.id}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-primary">
                          {drv.vi_actual?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize tracking-wide ${drv.estado === 'activo' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                            {drv.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" title="Ver Detalles" onClick={() => navigate(`/descarga/detalle/${drv.id}`)}>
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Editar Equipo" onClick={() => navigate(`/descarga/editar/${drv.id}`)}>
                              <Edit className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Eliminar Equipo" onClick={() => confirmDelete(drv)}>
                              <Trash2 className="w-4 h-4 text-destructive/80 hover:text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mini Recent Cuts List */}
          <div className="pt-8 border-t border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-xl font-bold text-foreground">Actividad Reciente de Cortes</h3>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-card rounded-xl border border-border animate-pulse" />)}
              </div>
            ) : stats.recentCuts.length === 0 ? (
              <p className="text-muted-foreground text-sm bg-card border border-border p-6 rounded-xl text-center">No hay cortes registrados recientemente.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.recentCuts.map(cut => (
                  <div key={cut.id} className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{cut.expand?.drv_id?.marca || 'DRV'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(cut.fecha_hora_vf).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold font-mono">{cut.corte.toLocaleString()} L</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar dispositivo DRV?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el dispositivo <strong className="text-foreground">{selectedDrvForDelete?.marca} {selectedDrvForDelete?.modelo}</strong> de la base de datos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default DRVPage;