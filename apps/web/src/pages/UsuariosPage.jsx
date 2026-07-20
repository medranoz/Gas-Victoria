import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useUsuarios } from '@/hooks/useUsuarios.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Plus, Pencil, Trash2, Search, Loader2, FilterX, Users, AlertCircle, RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const UsuariosPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    getUsuarios, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario, 
    generarContraseñaTemporal 
  } = useUsuarios();

  const [usuarios, setUsuarios] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterZona, setFilterZona] = useState('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Forms state
  const initialFormState = {
    email: '',
    nombre: '',
    rol: 'Recepcion',
    zona_asignada: '',
    password: '',
    estado: 'activo'
  };
  const [formData, setFormData] = useState(initialFormState);

  const userRole = currentUser?.role || '';
  const isSuperadmin = userRole === 'Superadmin';

  useEffect(() => {
    if (!userRole) {
      toast.error('Rol de usuario no configurado.');
      navigate('/');
      return;
    }

    if (userRole !== 'Superadmin' && userRole !== 'Administrador') {
      toast.error('Acceso denegado. Se requieren permisos de administración.');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [currentUser, userRole, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [usersRes, zonasRes] = await Promise.all([
        getUsuarios(1, 200),
        pb.collection('zonas_rutas').getFullList({ sort: 'nombre', $autoCancel: false }).catch(() => [])
      ]);
      
      if (usersRes?.exito) {
        setUsuarios(usersRes?.data || []);
      } else {
        setFetchError(usersRes?.error || 'Error al cargar la lista de usuarios.');
        toast.error(usersRes?.error || 'Error al cargar la lista de usuarios.');
      }
      setZonas(zonasRes || []);
    } catch (error) {
      console.error(error);
      setFetchError('Error de conexión al cargar datos iniciales.');
      toast.error('Error de conexión al cargar datos iniciales.');
    }
    setLoading(false);
  };

  const handleOpenCreate = () => {
    if (!isSuperadmin) {
      toast.error('Solo los Superadministradores pueden crear usuarios.');
      return;
    }
    setFormData(initialFormState);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user) => {
    if (!user) return;
    if (!isSuperadmin) {
      toast.error('Solo los Superadministradores pueden editar usuarios.');
      return;
    }
    setSelectedUser(user);
    setFormData({
      email: user?.email || '',
      nombre: user?.nombre || '',
      rol: user?.rol || 'Despachador',
      zona_asignada: user?.zona_asignada || '',
      estado: user?.estado || 'activo',
      password: '' // Empty password means no change
    });
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (user) => {
    if (!user) return;
    if (!isSuperadmin) {
      toast.error('Solo los Superadministradores pueden eliminar usuarios.');
      return;
    }
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    if (!isEditMode && !formData?.email) return 'El email es requerido';
    if (!isEditMode && !/^\S+@\S+\.\S+$/.test(formData?.email || '')) return 'Formato de email inválido';
    if (!formData?.rol) return 'El rol es requerido. Por favor seleccione uno.';
    
    const formRolLower = formData?.rol?.toLowerCase() || '';
    if (['recepcion', 'despachador'].includes(formRolLower) && !formData?.zona_asignada) {
      return `La zona asignada es requerida para el rol de ${formData?.rol}`;
    }
    
    if (!isEditMode && (formData?.password?.length || 0) < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (isEditMode && formData?.password && formData.password.length < 8) {
      return 'La nueva contraseña debe tener al menos 8 caracteres';
    }
    return null;
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    setSubmitting(true);
    
    let res;
    if (isEditMode) {
      res = await updateUsuario(selectedUser.id, formData);
    } else {
      res = await createUsuario(formData);
    }

    if (res?.exito) {
      toast.success(isEditMode ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
      setIsFormOpen(false);
      fetchData();
    } else {
      toast.error(res?.error || 'Error al guardar el usuario');
    }
    setSubmitting(false);
  };

  const onConfirmDelete = async () => {
    if (!selectedUser?.id) {
      toast.error('Usuario no válido para eliminar');
      return;
    }
    if (selectedUser?.id === currentUser?.id) {
      toast.error('No puedes eliminarte a ti mismo');
      return;
    }

    setSubmitting(true);
    const res = await deleteUsuario(selectedUser?.id);
    if (res?.exito) {
      toast.success('Usuario eliminado correctamente');
      setIsDeleteOpen(false);
      fetchData();
    } else {
      toast.error(res?.error || 'Error al eliminar el usuario');
    }
    setSubmitting(false);
  };

  // Filtering
  const filteredUsers = usuarios?.filter(user => {
    const searchLower = searchTerm?.toLowerCase() || '';
    const matchesSearch = (user?.email?.toLowerCase()?.includes(searchLower) || false) || 
                          (user?.nombre?.toLowerCase()?.includes(searchLower) || false);
    
    const matchesRole = filterRole === 'all' || user?.rol === filterRole;
    const matchesState = filterState === 'all' || user?.estado === filterState;
    const matchesZona = filterZona === 'all' || user?.zona_asignada === filterZona;
    
    return matchesSearch && matchesRole && matchesState && matchesZona;
  }) || [];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterState('all');
    setFilterZona('all');
  };

  const rolesDisponibles = ['Superadmin', 'Administrador', 'Contabilidad', 'Recepcion', 'Despachador'];

  if (!userRole || (userRole !== 'Superadmin' && userRole !== 'Administrador')) return null;

  return (
    <>
      <Helmet>
        <title>Gestión de Usuarios - Gas Victoria</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Gestión de Usuarios</h1>
                <p className="text-muted-foreground mt-1">Administra accesos, roles y zonas del personal operativo.</p>
              </div>
              {isSuperadmin && (
                <Button onClick={handleOpenCreate} className="w-full md:w-auto shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Nuevo Usuario
                </Button>
              )}
            </div>

            {!isSuperadmin && (
              <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Modo de solo lectura</h3>
                  <p className="text-sm mt-1">Como Administrador, puedes ver el directorio de usuarios. La creación, edición y eliminación de cuentas está restringida a Superadministradores.</p>
                </div>
              </div>
            )}

            <Card className="shadow-md border-border/60">
              <CardHeader className="bg-card border-b pb-4">
                <CardTitle className="text-xl">Filtros y Búsqueda</CardTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                  <div className="lg:col-span-2 relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o email..."
                      className="pl-9 bg-background text-foreground"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Roles</SelectItem>
                      {rolesDisponibles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={filterZona} onValueChange={setFilterZona}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Zona Asignada" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las Zonas</SelectItem>
                      {zonas?.map(z => <SelectItem key={z?.id} value={z?.id}>{z?.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={filterState} onValueChange={setFilterState}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Estados</SelectItem>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(searchTerm || filterRole !== 'all' || filterState !== 'all' || filterZona !== 'all') && (
                  <div className="mt-3 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                      <FilterX className="h-4 w-4 mr-2" />
                      Limpiar Filtros
                    </Button>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                    <p className="font-medium">Cargando directorio de usuarios...</p>
                  </div>
                ) : fetchError ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">No se pudieron cargar los usuarios</p>
                    <p className="text-muted-foreground mb-6 max-w-md">{fetchError}</p>
                    <Button onClick={fetchData} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reintentar
                    </Button>
                  </div>
                ) : filteredUsers?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-foreground">No se encontraron usuarios</p>
                    <p className="text-muted-foreground mt-1">Ajusta los filtros o realiza una nueva búsqueda.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="font-semibold text-foreground">Email / Nombre</TableHead>
                          <TableHead className="font-semibold text-foreground">Rol Asignado</TableHead>
                          <TableHead className="font-semibold text-foreground">Zona</TableHead>
                          <TableHead className="font-semibold text-foreground">Estado</TableHead>
                          {isSuperadmin && <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers?.map((user) => {
                          const userZona = zonas?.find(z => z?.id === user?.zona_asignada);
                          return (
                            <TableRow key={user?.id} className="hover:bg-muted/20 transition-colors group">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground">{user?.email || 'N/A'}</span>
                                  {user?.nombre && <span className="text-sm text-muted-foreground">{user?.nombre}</span>}
                                </div>
                              </TableCell>
                              <TableCell>
                                {user?.rol ? (
                                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-semibold tracking-wide uppercase text-[10px]">
                                    {user?.rol}
                                  </Badge>
                                ) : (
                                  <span className="text-destructive font-medium text-xs bg-destructive/10 px-2 py-1 rounded">Rol no disponible</span>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {userZona ? userZona?.nombre : <span className="text-muted-foreground/50">N/A</span>}
                              </TableCell>
                              <TableCell>
                                <Badge variant={user?.estado === 'activo' ? 'default' : 'secondary'} className={user?.estado === 'activo' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                                  {user?.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </TableCell>
                              {isSuperadmin && (
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleOpenEdit(user)} title="Editar Usuario">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleOpenDelete(user)} disabled={user?.id === currentUser?.id} title="Eliminar Usuario">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>

      {/* CREATE / EDIT MODAL */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? `Modificando perfil de ${selectedUser?.email || 'usuario'}` 
                : 'Completa los datos. La contraseña se generará automáticamente si la dejas en blanco.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmitForm} className="space-y-5 py-4">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              
              {!isEditMode && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="form-email">Correo Electrónico *</Label>
                  <Input id="form-email" type="email" value={formData?.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-background text-foreground" placeholder="usuario@empresa.com" />
                </div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="form-nombre">Nombre Opcional (Referencia)</Label>
                <Input id="form-nombre" value={formData?.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} className="bg-background text-foreground" placeholder="Ej. Juan Pérez" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="form-rol">Rol de Sistema *</Label>
                <Select value={formData?.rol || ''} onValueChange={v => setFormData({...formData, rol: v})}>
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesDisponibles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-estado">Estado *</Label>
                <Select value={formData?.estado || 'activo'} onValueChange={v => setFormData({...formData, estado: v})}>
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {['recepcion', 'despachador'].includes(formData?.rol?.toLowerCase() || '') && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="form-zona">Zona Asignada *</Label>
                  <Select value={formData?.zona_asignada || ''} onValueChange={v => setFormData({...formData, zona_asignada: v})}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Selecciona zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {zonas?.map(z => <SelectItem key={z?.id} value={z?.id}>{z?.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="form-pass" className="flex justify-between">
                  <span>{isEditMode ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}</span>
                  <button type="button" onClick={() => {
                    const pwd = generarContraseñaTemporal();
                    setFormData({...formData, password: pwd});
                    toast.success('Contraseña generada');
                  }} className="text-xs text-primary hover:underline">Autogenerar</button>
                </Label>
                <Input id="form-pass" type="text" value={formData?.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-background font-mono text-foreground tracking-widest" placeholder={isEditMode ? "Dejar en blanco para no cambiar" : "Mínimo 8 caracteres"} />
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={submitting}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive">Confirmar Eliminación</DialogTitle>
            <DialogDescription className="pt-2 text-base text-foreground/80">
              ¿Estás seguro de que deseas eliminar permanentemente al usuario <strong className="text-foreground">{selectedUser?.email || 'seleccionado'}</strong>?
            </DialogDescription>
            <p className="text-sm text-muted-foreground mt-2">Esta acción no se puede deshacer y el usuario perderá acceso al sistema inmediatamente.</p>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onConfirmDelete} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Sí, Eliminar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default UsuariosPage;