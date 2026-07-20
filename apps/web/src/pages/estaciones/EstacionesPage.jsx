import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useEstaciones } from '@/hooks/useEstaciones.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx';
import { Plus, Search, Download, Eye, Edit, Trash2, MapPin, Building2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const EstacionesPage = () => {
  const navigate = useNavigate();
  const { fetchEstaciones, deleteEstacion, exportToCSV, isLoading } = useEstaciones();
  
  const [estaciones, setEstaciones] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ rol: 'all', estado: 'all', responsable: 'all' });

  const loadData = async () => {
    const data = await fetchEstaciones(filters, search);
    setEstaciones(data.items || []);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const records = await pb.collection('users').getFullList({ sort: 'email', $autoCancel: false });
        setUsers(records);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filters, fetchEstaciones]);

  const handleDelete = async (id) => {
    const res = await deleteEstacion(id);
    if (res.success) {
      loadData();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet>
        <title>Catálogo de Estaciones - Gas Victoria</title>
      </Helmet>

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              Catálogo de Estaciones
            </h1>
            <p className="text-muted-foreground mt-1">Gestiona las plantas y estaciones de carburación.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => exportToCSV(estaciones)} disabled={isLoading || estaciones.length === 0}>
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
            <Button asChild>
              <Link to="/estaciones/nuevo">
                <Plus className="w-4 h-4 mr-2" /> Nueva Estación
              </Link>
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre o ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filters.rol} onValueChange={(val) => setFilters(p => ({...p, rol: val}))}>
            <SelectTrigger>
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="PLANTA">PLANTA</SelectItem>
              <SelectItem value="DE CARBURACIÓN">DE CARBURACIÓN</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.estado} onValueChange={(val) => setFilters(p => ({...p, estado: val}))}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="activa">Activa</SelectItem>
              <SelectItem value="inactiva">Inactiva</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.responsable} onValueChange={(val) => setFilters(p => ({...p, responsable: val}))}>
            <SelectTrigger>
              <SelectValue placeholder="Responsable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los responsables</SelectItem>
              {users.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Estación</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-center">Equipos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : estaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No se encontraron estaciones con los filtros actuales.
                  </TableCell>
                </TableRow>
              ) : (
                estaciones.map((est) => (
                  <TableRow key={est.id} className="group">
                    <TableCell>
                      <div className="font-medium text-foreground">{est.nombre}</div>
                      <div className="text-xs text-muted-foreground font-mono">{est.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={est.rol === 'PLANTA' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/10 text-secondary-foreground border-secondary/20'}>
                        {est.rol}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {est.expand?.responsable_id?.email || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <span title="Tanques">{est.tanquesCount || 0} T</span>
                        <span>•</span>
                        <span title="DRVs">{est.drvsCount || 0} D</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={est.estado_estacion === 'activa' ? 'default' : 'destructive'} className={est.estado_estacion === 'activa' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}>
                        {est.estado_estacion}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/estaciones/detalle/${est.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/estaciones/editar/${est.id}`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar estación?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará la estación "{est.nombre}" y sus asociaciones.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(est.id)} className="bg-destructive text-destructive-foreground">
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default EstacionesPage;