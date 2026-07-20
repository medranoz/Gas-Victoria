import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Plus, Pencil, Eye, Bell, AlertTriangle, X } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCalculateTankAvailability } from '@/hooks/useCalculateTankAvailability.js';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import ProgressBar from '@/components/ProgressBar.jsx';

import CreateTankModal from '@/components/tanques/CreateTankModal.jsx';
import EditTankModal from '@/components/tanques/EditTankModal.jsx';
import NotificationConfigModal from '@/components/tanques/NotificationConfigModal.jsx';
import TankDetailsModal from '@/components/tanques/TankDetailsModal.jsx';

// Sub-component to render each row with its own hook state
const TankRow = ({ tank, onEdit, onConfig, onView }) => {
  const { carga_disponible, porcentaje_disponible, estado, loading } = useCalculateTankAvailability(tank.id);

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="font-medium">{tank.nombre}</TableCell>
      <TableCell>{tank.capacidad?.toLocaleString()}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{tank.carga_inicial?.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">
            {tank.fecha_carga_inicial ? new Date(tank.fecha_carga_inicial).toLocaleDateString() : ''}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {loading ? <Skeleton className="h-4 w-16" /> : <span>{carga_disponible.toLocaleString()}</span>}
      </TableCell>
      <TableCell className="w-[200px]">
        {loading ? <Skeleton className="h-4 w-full" /> : <ProgressBar percentage={porcentaje_disponible} estado={estado} showLabel={false} />}
      </TableCell>
      <TableCell>
        {loading ? <Skeleton className="h-6 w-16 rounded-full" /> : (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
            ${estado === 'verde' ? 'bg-emerald-100 text-emerald-800' : 
              estado === 'amarillo' ? 'bg-amber-100 text-amber-800' : 
              estado === 'rojo' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'}`}>
            {estado}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button size="icon" variant="ghost" onClick={() => onView(tank)} title="Ver Detalles">
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onConfig(tank)} title="Configurar Notificaciones">
            <Bell className={`h-4 w-4 ${tank.notificacion_activa ? 'text-primary' : 'text-muted-foreground'}`} />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onEdit(tank)} title="Editar">
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const TanquesPage = () => {
  const { currentUser } = useAuth();
  const [tanques, setTanques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTank, setSelectedTank] = useState(null);

  const fetchTanques = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('tanques').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setTanques(records);
      checkNotifications(records);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los tanques');
    } finally {
      setLoading(false);
    }
  };

  const checkNotifications = async (tanksList) => {
    if (!currentUser) return;
    
    const newAlerts = [];
    const today = new Date().toISOString().split('T')[0];

    for (const tank of tanksList) {
      if (tank.notificacion_activa && tank.porcentaje_notificacion > 0) {
        // Calculate availability manually here to avoid hook rules
        try {
          const ventas = await pb.collection('ventas').getFullList({
            filter: `tanque = "${tank.id}" && estado != "cancelado"`,
            $autoCancel: false
          });
          const total_vendido = ventas.reduce((sum, v) => sum + (v.cantidad || 0), 0);
          const carga_disponible = Math.max(0, (tank.carga_inicial || 0) - total_vendido);
          const porcentaje_disponible = tank.capacidad ? (carga_disponible / tank.capacidad) * 100 : 0;

          if (porcentaje_disponible < tank.porcentaje_notificacion) {
            const lastNotifDate = tank.ultima_notificacion ? tank.ultima_notificacion.split(' ')[0] : null;
            
            if (lastNotifDate !== today) {
              // Create notification record
              const msg = `⚠️ Tanque ${tank.nombre} está bajo (${porcentaje_disponible.toFixed(1)}% disponible). Recarga recomendada.`;
              await pb.collection('notificaciones').create({
                tipo: 'sistema',
                mensaje: msg,
                usuario_destino: currentUser.id,
                leida: false
              }, { $autoCancel: false });

              // Update tank's ultima_notificacion
              await pb.collection('tanques').update(tank.id, {
                ultima_notificacion: new Date().toISOString()
              }, { $autoCancel: false });

              newAlerts.push(msg);
            }
          }
        } catch (e) {
          console.error('Error checking notifications for tank', tank.id, e);
        }
      }
    }

    if (newAlerts.length > 0) {
      setNotifications(prev => [...prev, ...newAlerts]);
    }
  };

  useEffect(() => {
    fetchTanques();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (tank) => { setSelectedTank(tank); setEditOpen(true); };
  const handleConfig = (tank) => { setSelectedTank(tank); setConfigOpen(true); };
  const handleView = (tank) => { setSelectedTank(tank); setDetailsOpen(true); };

  return (
    <>
      <Helmet>
        <title>Tanques | Sistema Gas</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          
          {notifications.length > 0 && (
            <div className="mb-6 space-y-2">
              {notifications.map((notif, idx) => (
                <div key={idx} className="bg-rose-500 text-white px-4 py-3 rounded-lg shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    <p className="font-medium">{notif}</p>
                  </div>
                  <button onClick={() => setNotifications(n => n.filter((_, i) => i !== idx))} className="text-white/80 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Tanques</h1>
              <p className="text-muted-foreground mt-1">Monitorea la capacidad y disponibilidad de combustible.</p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Tanque
            </Button>
          </div>

          <Card className="shadow-sm border-border/50">
            <CardHeader className="bg-card">
              <CardTitle>Inventario de Tanques</CardTitle>
              <CardDescription>Listado de todos los tanques registrados y su estado en tiempo real.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full rounded-md" />)}
                </div>
              ) : tanques.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground">No hay tanques registrados en el sistema.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Capacidad</TableHead>
                        <TableHead>Carga Inicial</TableHead>
                        <TableHead>Disponible</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tanques.map((tank) => (
                        <TankRow 
                          key={tank.id} 
                          tank={tank} 
                          onEdit={handleEdit} 
                          onConfig={handleConfig} 
                          onView={handleView} 
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        
        <Footer />

        <CreateTankModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSuccess={fetchTanques} />
        <EditTankModal isOpen={editOpen} onClose={() => setEditOpen(false)} onSuccess={fetchTanques} tank={selectedTank} />
        <NotificationConfigModal isOpen={configOpen} onClose={() => setConfigOpen(false)} onSuccess={fetchTanques} tank={selectedTank} />
        <TankDetailsModal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} tank={selectedTank} />
      </div>
    </>
  );
};

export default TanquesPage;