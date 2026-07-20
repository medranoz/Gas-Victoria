import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check, CheckCircle2, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const NotificacionesPage = () => {
  const { currentUser } = useAuth();
  const { markAsRead, markAllAsRead, deleteNotification } = useNotificationSystem();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    tipo: 'all',
    estatus: 'all',
    fechaDesde: '',
    fechaHasta: ''
  });

  useEffect(() => {
    fetchNotificaciones();
  }, [filters]);

  const fetchNotificaciones = async () => {
    setLoading(true);
    try {
      let filterConditions = [`usuario_destino = "${currentUser.id}"`];

      if (filters.tipo !== 'all') {
        filterConditions.push(`tipo = "${filters.tipo}"`);
      }
      if (filters.estatus !== 'all') {
        filterConditions.push(`leida = ${filters.estatus === 'leida'}`);
      }
      if (filters.fechaDesde) {
        filterConditions.push(`created >= "${filters.fechaDesde} 00:00:00"`);
      }
      if (filters.fechaHasta) {
        const nextDay = new Date(filters.fechaHasta);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        filterConditions.push(`created < "${nextDayStr} 00:00:00"`);
      }

      const records = await pb.collection('notificaciones').getFullList({
        filter: filterConditions.join(' && '),
        sort: '-created',
        $autoCancel: false
      });

      setNotificaciones(records);
    } catch (error) {
      toast.error('Error al cargar notificaciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    const res = await markAsRead(id);
    if (res.success) {
      toast.success('Notificación marcada como leída');
      fetchNotificaciones();
    } else {
      toast.error('Error al actualizar notificación');
    }
  };

  const handleMarkAllAsRead = async () => {
    const res = await markAllAsRead(currentUser.id);
    if (res.success) {
      toast.success(`${res.count} notificaciones marcadas como leídas`);
      fetchNotificaciones();
    } else {
      toast.error('Error al actualizar notificaciones');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta notificación?')) return;
    const res = await deleteNotification(id);
    if (res.success) {
      toast.success('Notificación eliminada');
      fetchNotificaciones();
    } else {
      toast.error('Error al eliminar notificación');
    }
  };

  const getTipoBadge = (tipo) => {
    const styles = {
      cambio_estatus: 'bg-blue-100 text-blue-800',
      recordatorio: 'bg-orange-100 text-orange-800',
      sistema: 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[tipo] || styles.sistema}`}>{tipo.replace('_', ' ')}</span>;
  };

  return (
    <>
      <Helmet>
        <title>Notificaciones - Gas Victoria</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 bg-muted/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                  <Bell className="h-8 w-8 text-primary" />
                  Centro de Notificaciones
                </h1>
                <p className="text-muted-foreground">Revisa tus alertas y actualizaciones del sistema</p>
              </div>
              <Button onClick={handleMarkAllAsRead} variant="outline" className="bg-white">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Marcar todas como leídas
              </Button>
            </div>

            <Card className="mb-6 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={filters.tipo} onValueChange={(v) => setFilters({...filters, tipo: v})}>
                    <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="cambio_estatus">Cambio de Estatus</SelectItem>
                      <SelectItem value="recordatorio">Recordatorio</SelectItem>
                      <SelectItem value="sistema">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.estatus} onValueChange={(v) => setFilters({...filters, estatus: v})}>
                    <SelectTrigger><SelectValue placeholder="Estatus" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estatus</SelectItem>
                      <SelectItem value="leida">Leídas</SelectItem>
                      <SelectItem value="no_leida">No leídas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="date" 
                    value={filters.fechaDesde} 
                    onChange={(e) => setFilters({...filters, fechaDesde: e.target.value})}
                    placeholder="Desde"
                  />
                  <Input 
                    type="date" 
                    value={filters.fechaHasta} 
                    onChange={(e) => setFilters({...filters, fechaHasta: e.target.value})}
                    placeholder="Hasta"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  </div>
                ) : notificaciones.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center">
                    <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No tienes notificaciones</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Mensaje</TableHead>
                          <TableHead>Estatus</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notificaciones.map((notif) => (
                          <TableRow key={notif.id} className={notif.leida ? 'bg-transparent' : 'bg-primary/5'}>
                            <TableCell className="whitespace-nowrap text-sm">
                              {new Date(notif.created).toLocaleString()}
                            </TableCell>
                            <TableCell>{getTipoBadge(notif.tipo)}</TableCell>
                            <TableCell className={`max-w-md ${notif.leida ? 'text-muted-foreground' : 'font-medium'}`}>
                              {notif.mensaje}
                            </TableCell>
                            <TableCell>
                              {notif.leida ? (
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Check className="h-3 w-3"/> Leída</span>
                              ) : (
                                <span className="text-xs font-bold text-primary">Nueva</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {!notif.leida && (
                                  <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notif.id)} title="Marcar como leída">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(notif.id)} title="Eliminar">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
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
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default NotificacionesPage;