import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useClientes } from '@/hooks/useClientes.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Plus, Pencil, Trash2, Search, Bell, Users } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const ClientesPage = () => {
  const { currentUser } = useAuth();
  const { fetchClientes, createCliente, updateCliente, deleteCliente, loading } = useClientes();
  
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    notas: '',
    activo: true
  });
  
  const [reminderData, setReminderData] = useState({
    enabled: false,
    days: 30,
    fecha_proxima_venta: ''
  });

  const canDelete = currentUser && (currentUser.role === 'Superadmin' || currentUser.role === 'Administrador');
  const canEdit = currentUser && (currentUser.role === 'Superadmin' || currentUser.role === 'Administrador' || currentUser.role === 'Recepcion');

  const loadData = async () => {
    const res = await fetchClientes();
    if (res.success) {
      setClientes(res.data || []);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createCliente(formData);
    
    if (res.success) {
      if (reminderData.enabled && reminderData.fecha_proxima_venta) {
        try {
          await pb.collection('recordatorios_clientes').create({
            cliente: res.data.id,
            fecha_proxima_recordatorio: reminderData.fecha_proxima_venta,
            dias_sin_comprar: reminderData.days,
            fecha_ultima_compra: new Date().toISOString().split('T')[0],
            estatus: 'pendiente',
            creado_por: currentUser.id
          }, { $autoCancel: false });
        } catch (err) {
          console.error('Error creating reminder:', err);
        }
      }
      setIsCreateOpen(false);
      resetForm();
      loadData();
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedCliente) return;

    const res = await updateCliente(selectedCliente.id, formData);
    if (res.success) {
      setIsEditOpen(false);
      resetForm();
      loadData();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    const res = await deleteCliente(id);
    if (res.success) {
      loadData();
    }
  };

  const openEditDialog = (cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      nombre: cliente.nombre || '',
      direccion: cliente.direccion || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      notas: cliente.notas || '',
      activo: cliente.activo !== false
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      notas: '',
      activo: true
    });
    setReminderData({
      enabled: false,
      days: 30,
      fecha_proxima_venta: ''
    });
    setSelectedCliente(null);
  };

  const calculateReminderDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(days));
    return date.toISOString().split('T')[0];
  };

  const handleReminderDaysChange = (days) => {
    setReminderData({
      ...reminderData,
      days,
      fecha_proxima_venta: calculateReminderDate(days)
    });
  };

  const filteredClientes = clientes.filter(cliente =>
    (cliente.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.telefono || '').includes(searchTerm) ||
    (cliente.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Clientes - Gas Victoria</title>
        <meta name="description" content="Gestiona los clientes de tu distribuidora de gas LP." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Clientes</h1>
              </div>
              <p className="text-muted-foreground">Administra tu base de clientes y recordatorios de venta.</p>
            </div>

            <Card className="shadow-sm border-border/50">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-xl">Directorio de Clientes</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full sm:w-64 bg-background"
                      />
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetForm} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Plus className="mr-2 h-4 w-4" />
                          Nuevo Cliente
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                        <DialogHeader>
                          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
                          <DialogDescription>Ingresa los datos del cliente para registrarlo en el sistema.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="nombre">Nombre completo / Razón Social *</Label>
                              <Input
                                id="nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Correo Electrónico</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="direccion">Dirección</Label>
                              <Input
                                id="direccion"
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="telefono">Teléfono</Label>
                              <Input
                                id="telefono"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="notas">Notas Adicionales</Label>
                            <Textarea
                              id="notas"
                              value={formData.notas}
                              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                              rows={3}
                              className="bg-background resize-none"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                              id="activo"
                              checked={formData.activo}
                              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                            />
                            <Label htmlFor="activo" className="cursor-pointer font-medium">Cliente activo</Label>
                          </div>
                          
                          <div className="border-t border-border/50 pt-4 mt-4">
                            <div className="flex items-center space-x-2 mb-4">
                              <Checkbox
                                id="reminder"
                                checked={reminderData.enabled}
                                onCheckedChange={(checked) => setReminderData({ ...reminderData, enabled: checked })}
                              />
                              <Label htmlFor="reminder" className="cursor-pointer flex items-center gap-2 font-medium">
                                <Bell className="h-4 w-4 text-primary" />
                                Programar recordatorio de próxima venta
                              </Label>
                            </div>
                            {reminderData.enabled && (
                              <div className="space-y-2 ml-6 bg-muted/30 p-4 rounded-lg border border-border/50">
                                <Label htmlFor="days">Recordar dentro de (días)</Label>
                                <Input
                                  id="days"
                                  type="number"
                                  min="1"
                                  value={reminderData.days}
                                  onChange={(e) => handleReminderDaysChange(e.target.value)}
                                  className="bg-background max-w-[150px]"
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                  Fecha programada: <span className="font-medium text-foreground">{reminderData.fecha_proxima_venta}</span>
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                              Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                              {loading ? 'Guardando...' : 'Guardar Cliente'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading && clientes.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Cargando directorio...</p>
                  </div>
                ) : filteredClientes.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground">No se encontraron clientes</p>
                    <p className="text-muted-foreground mt-1">Intenta con otros términos de búsqueda o registra un nuevo cliente.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/10 hover:bg-muted/10">
                          <TableHead className="font-semibold">Nombre / Razón Social</TableHead>
                          <TableHead className="font-semibold">Contacto</TableHead>
                          <TableHead className="font-semibold">Dirección</TableHead>
                          <TableHead className="font-semibold">Estado</TableHead>
                          <TableHead className="text-right font-semibold">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClientes.map((cliente) => (
                          <TableRow key={cliente.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">{cliente.nombre}</TableCell>
                            <TableCell>
                              <div className="text-sm">{cliente.telefono || '-'}</div>
                              <div className="text-xs text-muted-foreground">{cliente.email || ''}</div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={cliente.direccion}>
                              {cliente.direccion || '-'}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                cliente.activo !== false 
                                  ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}>
                                {cliente.activo !== false ? 'Activo' : 'Inactivo'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {canEdit && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => openEditDialog(cliente)}
                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {canDelete && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDelete(cliente.id)}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                <DialogHeader>
                  <DialogTitle>Editar Cliente</DialogTitle>
                  <DialogDescription>Actualiza la información del cliente en el sistema.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEdit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_nombre">Nombre completo / Razón Social *</Label>
                      <Input
                        id="edit_nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_email">Correo Electrónico</Label>
                      <Input
                        id="edit_email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit_direccion">Dirección</Label>
                      <Input
                        id="edit_direccion"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_telefono">Teléfono</Label>
                      <Input
                        id="edit_telefono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit_notas">Notas Adicionales</Label>
                    <Textarea
                      id="edit_notas"
                      value={formData.notas}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                      rows={3}
                      className="bg-background resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="edit_activo"
                      checked={formData.activo}
                      onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                    />
                    <Label htmlFor="edit_activo" className="cursor-pointer font-medium">Cliente activo</Label>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-border/50 mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
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

export default ClientesPage;