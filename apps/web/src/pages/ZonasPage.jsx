import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const ZonasPage = () => {
  const { currentUser } = useAuth();
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedZona, setSelectedZona] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const canModify = currentUser && (currentUser.role === 'superadmin' || currentUser.role === 'administrador');

  useEffect(() => {
    fetchZonas();
  }, []);

  const fetchZonas = async () => {
    try {
      const records = await pb.collection('zonas_rutas').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setZonas(records);
    } catch (error) {
      toast.error('Error al cargar zonas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await pb.collection('zonas_rutas').create(formData, { $autoCancel: false });
      toast.success('Zona creada correctamente');
      setIsCreateOpen(false);
      resetForm();
      fetchZonas();
    } catch (error) {
      toast.error('Error al crear zona');
      console.error(error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedZona) return;

    try {
      await pb.collection('zonas_rutas').update(selectedZona.id, formData, { $autoCancel: false });
      toast.success('Zona actualizada correctamente');
      setIsEditOpen(false);
      resetForm();
      fetchZonas();
    } catch (error) {
      toast.error('Error al actualizar zona');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta zona?')) return;

    try {
      await pb.collection('zonas_rutas').delete(id, { $autoCancel: false });
      toast.success('Zona eliminada correctamente');
      fetchZonas();
    } catch (error) {
      toast.error('Error al eliminar zona');
      console.error(error);
    }
  };

  const openEditDialog = (zona) => {
    setSelectedZona(zona);
    setFormData({
      nombre: zona.nombre,
      descripcion: zona.descripcion || ''
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: ''
    });
    setSelectedZona(null);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Cargando zonas...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Zonas y rutas - Gas Victoria</title>
        <meta name="description" content="Gestiona las zonas y rutas de distribución de gas LP." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Zonas y rutas</h1>
              <p className="text-muted-foreground">Administra las zonas de distribución</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Lista de zonas</CardTitle>
                  {canModify && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                          <Plus className="mr-2 h-4 w-4" />
                          Nueva zona
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear nueva zona</DialogTitle>
                          <DialogDescription>Completa los datos de la zona</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                              id="nombre"
                              value={formData.nombre}
                              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                              required
                              className="text-foreground"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Input
                              id="descripcion"
                              value={formData.descripcion}
                              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                              className="text-foreground"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                              Cancelar
                            </Button>
                            <Button type="submit">Crear zona</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {zonas.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No hay zonas registradas</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        {canModify && <TableHead className="text-right">Acciones</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zonas.map((zona) => (
                        <TableRow key={zona.id}>
                          <TableCell className="font-medium">{zona.nombre}</TableCell>
                          <TableCell>{zona.descripcion || '-'}</TableCell>
                          {canModify && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditDialog(zona)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(zona.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar zona</DialogTitle>
                  <DialogDescription>Actualiza los datos de la zona</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEdit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_nombre">Nombre *</Label>
                    <Input
                      id="edit_nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      className="text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_descripcion">Descripción</Label>
                    <Input
                      id="edit_descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="text-foreground"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Guardar cambios</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ZonasPage;