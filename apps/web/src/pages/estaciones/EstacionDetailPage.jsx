import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import DRVSelector from '@/components/estaciones/DRVSelector.jsx';
import TanqueSelector from '@/components/estaciones/TanqueSelector.jsx';
import { useEstaciones } from '@/hooks/useEstaciones.js';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx';
import { ArrowLeft, Building2, Edit, MapPin, Phone, User, Plus, DatabaseZap, Container } from 'lucide-react';

const EstacionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEstacionById, associateDRV, removeDRV, associateTanque, removeTanque, isLoading } = useEstaciones();
  
  const [estacion, setEstacion] = useState(null);
  const [isDRVModalOpen, setIsDRVModalOpen] = useState(false);
  const [isTanqueModalOpen, setIsTanqueModalOpen] = useState(false);

  const loadData = async () => {
    const data = await getEstacionById(id);
    if (data) {
      setEstacion(data);
    } else {
      navigate('/estaciones');
    }
  };

  useEffect(() => {
    loadData();
  }, [id, getEstacionById, navigate]);

  const handleAssociateDRVs = async (drvIds) => {
    for (const dId of drvIds) {
      await associateDRV(id, dId);
    }
    loadData();
  };

  const handleRemoveDRV = async (relId) => {
    await removeDRV(relId);
    loadData();
  };

  const handleAssociateTanques = async (tanqueIds) => {
    for (const tId of tanqueIds) {
      await associateTanque(id, tId);
    }
    loadData();
  };

  const handleRemoveTanque = async (tanqueId) => {
    await removeTanque(tanqueId);
    loadData();
  };

  if (!estacion && isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="bg-card rounded-2xl p-8 border border-border mb-8">
            <Skeleton className="h-10 w-1/3 mb-4" />
            <Skeleton className="h-6 w-1/4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!estacion) return null;

  const address = [estacion.calle, estacion.numero, estacion.colonia, estacion.municipio, estacion.estado].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet>
        <title>{estacion.nombre} - Gas Victoria</title>
      </Helmet>

      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <Button variant="ghost" onClick={() => navigate('/estaciones')} className="mb-6 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Catálogo
        </Button>

        <div className="bg-card rounded-3xl p-6 md:p-10 border border-border shadow-sm mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{estacion.nombre}</h1>
                <p className="text-sm text-muted-foreground font-mono mt-1">ID: {estacion.id}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge variant="outline" className={estacion.rol === 'PLANTA' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/10 text-secondary-foreground border-secondary/20'}>
                {estacion.rol}
              </Badge>
              <Badge variant={estacion.estado_estacion === 'activa' ? 'default' : 'destructive'} className={estacion.estado_estacion === 'activa' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}>
                {estacion.estado_estacion}
              </Badge>
            </div>
          </div>
          
          <Button onClick={() => navigate(`/estaciones/editar/${estacion.id}`)} variant="outline" className="shrink-0">
            <Edit className="w-4 h-4 mr-2" /> Editar Estación
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground" /> Ubicación y Contacto
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Dirección Completa</p>
                <p className="font-medium">{address || 'No especificada'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" /> {estacion.telefono || 'No especificado'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" /> Personal
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Responsable</p>
                <p className="font-medium">{estacion.expand?.responsable_id?.email || 'No asignado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Creado por</p>
                <p className="font-medium text-sm">{estacion.expand?.usuario_creacion?.email || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="tanques" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
            <TabsTrigger value="tanques" className="flex items-center justify-center gap-2">
              <Container className="w-4 h-4" /> Tanques
            </TabsTrigger>
            <TabsTrigger value="drvs" className="flex items-center justify-center gap-2">
              <DatabaseZap className="w-4 h-4" /> DRVs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tanques" className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Tanques Asociados</h3>
              <Button onClick={() => setIsTanqueModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" /> Agregar Tanque
              </Button>
            </div>
            
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Número / Nombre</TableHead>
                    <TableHead>Capacidad Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estacion.tanques?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No hay tanques asociados a esta estación.
                      </TableCell>
                    </TableRow>
                  ) : (
                    estacion.tanques?.map(tanque => (
                      <TableRow key={tanque.id}>
                        <TableCell className="font-medium">{tanque.numero_tanque}</TableCell>
                        <TableCell>{tanque.capacidad_total?.toLocaleString()} L</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tanque.estado}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                Remover
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Remover Tanque?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  El tanque "{tanque.numero_tanque}" dejará de estar asociado a esta estación.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveTanque(tanque.id)} className="bg-destructive text-destructive-foreground">
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="drvs" className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Dispositivos de Registro Volumétrico</h3>
              <Button onClick={() => setIsDRVModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" /> Agregar DRV
              </Button>
            </div>
            
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Marca / Modelo</TableHead>
                    <TableHead>VI Actual</TableHead>
                    <TableHead>ID DRV</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estacion.drvs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No hay DRVs asociados a esta estación.
                      </TableCell>
                    </TableRow>
                  ) : (
                    estacion.drvs?.map(drv => (
                      <TableRow key={drv.id}>
                        <TableCell className="font-medium">{drv.marca} - {drv.modelo}</TableCell>
                        <TableCell>{drv.vi_actual?.toLocaleString()} L</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{drv.id}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                Remover
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Remover DRV?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  El DRV "{drv.marca}" dejará de estar asociado a esta estación.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveDRV(drv.relId)} className="bg-destructive text-destructive-foreground">
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

      </main>

      <TanqueSelector 
        isOpen={isTanqueModalOpen} 
        onClose={() => setIsTanqueModalOpen(false)} 
        onAssociate={handleAssociateTanques}
        currentTanques={estacion.tanques}
      />
      
      <DRVSelector 
        isOpen={isDRVModalOpen} 
        onClose={() => setIsDRVModalOpen(false)} 
        onAssociate={handleAssociateDRVs}
        currentDRVs={estacion.drvs}
      />

      <Footer />
    </div>
  );
};

export default EstacionDetailPage;