import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, Pencil, Trash2, Eye, Map, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';

import { useZonas } from '@/hooks/useZonas.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ZonasPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { fetchZonas, deleteZona } = useZonas();
  
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canModify = currentUser?.role === 'Superadmin' || currentUser?.role === 'Administrador';

  const loadZonas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchZonas();
      setZonas(data);
    } catch (err) {
      setError('No se pudieron cargar las zonas. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZonas();
  }, [fetchZonas]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteZona(deleteId);
      toast.success('Zona eliminada correctamente');
      setZonas(zonas.filter(z => z.id !== deleteId));
    } catch (err) {
      toast.error('Error al eliminar la zona');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Catálogo de Zonas - Gas Victoria</title></Helmet>
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Map className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Catálogo de Zonas</h1>
              <p className="text-muted-foreground mt-1">Gestión de zonas y rutas de distribución operativa.</p>
            </div>
          </div>
          {canModify && (
            <Button asChild className="h-12 px-6 rounded-xl shadow-sm">
              <Link to="/zonas/nuevo"><Plus className="w-5 h-5 mr-2" /> Nueva Zona</Link>
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription className="flex items-center justify-between mt-2">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadZonas}>
                <RefreshCw className="w-3 h-3 mr-2" /> Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border shadow-sm rounded-2xl overflow-hidden bg-card">
          <CardHeader className="bg-muted/10 border-b pb-4">
            <CardTitle className="text-xl">Zonas Registradas</CardTitle>
            <CardDescription>Listado completo de áreas geográficas de cobertura.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : zonas.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No hay zonas registradas</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Comienza agregando las zonas o rutas geográficas donde operan los autotanques y el personal.
                </p>
                {canModify && (
                  <Button asChild variant="outline">
                    <Link to="/zonas/nuevo"><Plus className="w-4 h-4 mr-2" /> Crear primera zona</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[30%]">Nombre de Zona</TableHead>
                      <TableHead className="w-[40%]">Descripción</TableHead>
                      <TableHead className="w-[15%]">Fecha Registro</TableHead>
                      <TableHead className="text-right w-[15%]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zonas.map((zona) => (
                      <TableRow key={zona.id} className="group transition-colors">
                        <TableCell className="font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary/60" />
                            {zona.nombre}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {zona.descripcion || <span className="opacity-50 italic">Sin descripción</span>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground tabular-nums">
                          {new Date(zona.created).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => navigate(`/zonas/detalle/${zona.id}`)} title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canModify && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50" onClick={() => navigate(`/zonas/editar/${zona.id}`)} title="Editar">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(zona.id)} title="Eliminar">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Confirmar eliminación?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La zona será eliminada permanentemente del sistema. Si está vinculada a costos o rutas activas, podría causar inconsistencias.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar Zona'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ZonasPage;