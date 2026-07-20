import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useReminders } from '@/hooks/useReminders';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, Plus, Search, CheckCircle, Send, History } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const RecordatoriosPage = () => {
  const { currentUser } = useAuth();
  const { createAutoReminders } = useReminders();
  const [recordatorios, setRecordatorios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pendiente');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    notas: '',
    fecha_proximo_recordatorio: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recData, cliData] = await Promise.all([
        pb.collection('recordatorios_clientes').getFullList({
          filter: statusFilter !== 'all' ? `estatus = "${statusFilter}"` : '',
          sort: 'fecha_proximo_recordatorio',
          expand: 'cliente,creado_por',
          $autoCancel: false
        }),
        pb.collection('clientes').getFullList({ sort: 'nombre_completo', $autoCancel: false })
      ]);
      setRecordatorios(recData);
      setClientes(cliData);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    try {
      // Get last purchase for this client
      const ventas = await pb.collection('ventas').getList(1, 1, {
        filter: `cliente = "${formData.cliente}" && estatus != "cancelado"`,
        sort: '-fecha',
        $autoCancel: false
      });

      let lastPurchaseDate = new Date();
      let daysSince = 0;

      if (ventas.items.length > 0) {
        lastPurchaseDate = new Date(ventas.items[0].fecha);
        const diffTime = Math.abs(new Date() - lastPurchaseDate);
        daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      await pb.collection('recordatorios_clientes').create({
        cliente: formData.cliente,
        fecha_ultima_compra: lastPurchaseDate.toISOString(),
        dias_sin_comprar: daysSince,
        fecha_proximo_recordatorio: new Date(formData.fecha_proximo_recordatorio).toISOString(),
        estatus: 'pendiente',
        creado_por: currentUser.id,
        notas: formData.notas
      }, { $autoCancel: false });

      toast.success('Recordatorio creado');
      setIsCreateOpen(false);
      setFormData({ cliente: '', notas: '', fecha_proximo_recordatorio: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      toast.error('Error al crear recordatorio');
      console.error(error);
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      await pb.collection('recordatorios_clientes').update(id, { estatus: 'completado' }, { $autoCancel: false });
      toast.success('Recordatorio completado');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleSendReminder = async (id) => {
    try {
      // In a real app, this might trigger an SMS/Email API. Here we just log it.
      await pb.collection('historial_actividades').create({
        tipo_actividad: 'creacion_recordatorio',
        descripcion: 'Se envió recordatorio al cliente',
        usuario: currentUser.id,
        entidad_relacionada: id
      }, { $autoCancel: false });
      
      toast.success('Recordatorio enviado/registrado');
    } catch (error) {
      toast.error('Error al registrar envío');
    }
  };

  const handleAutoGenerate = async () => {
    setLoading(true);
    const res = await createAutoReminders(currentUser.id, 30);
    if (res.success) {
      toast.success(`Se generaron ${res.count} recordatorios automáticos`);
      fetchData();
    } else {
      toast.error('Error al generar recordatorios');
      setLoading(false);
    }
  };

  const filteredRecords = recordatorios.filter(r => {
    const clientName = r.expand?.cliente?.nombre_completo || r.expand?.cliente?.nombre || '';
    return clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <Helmet>
        <title>Recordatorios - Gas Victoria</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 bg-muted/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                  <CalendarClock className="h-8 w-8 text-primary" />
                  Recordatorios de Clientes
                </h1>
                <p className="text-muted-foreground">Gestiona el seguimiento a clientes inactivos</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleAutoGenerate} disabled={loading}>
                  Generar Automáticos (30+ días)
                </Button>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Manual
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Recordatorio Manual</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateManual} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Cliente *</Label>
                        <Select value={formData.cliente} onValueChange={(v) => setFormData({...formData, cliente: v})} required>
                          <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
                          <SelectContent>
                            {clientes.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.nombre_completo || c.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha Sugerida *</Label>
                        <Input 
                          type="date" 
                          value={formData.fecha_proximo_recordatorio} 
                          onChange={(e) => setFormData({...formData, fecha_proximo_recordatorio: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Notas</Label>
                        <Input 
                          value={formData.notas} 
                          onChange={(e) => setFormData({...formData, notas: e.target.value})}
                          placeholder="Motivo del recordatorio..."
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                        <Button type="submit">Guardar</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estatus</SelectItem>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                      <SelectItem value="completado">Completados</SelectItem>
                      <SelectItem value="cancelado">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    No se encontraron recordatorios
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Última Compra</TableHead>
                          <TableHead>Días Inactivo</TableHead>
                          <TableHead>Fecha Sugerida</TableHead>
                          <TableHead>Estatus</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map((rec) => (
                          <TableRow key={rec.id}>
                            <TableCell className="font-medium">{rec.expand?.cliente?.nombre_completo || rec.expand?.cliente?.nombre}</TableCell>
                            <TableCell>{rec.expand?.cliente?.telefono || 'N/A'}</TableCell>
                            <TableCell>{new Date(rec.fecha_ultima_compra).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className={`font-bold ${rec.dias_sin_comprar > 45 ? 'text-destructive' : 'text-orange-500'}`}>
                                {rec.dias_sin_comprar} días
                              </span>
                            </TableCell>
                            <TableCell>{new Date(rec.fecha_proximo_recordatorio).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                rec.estatus === 'completado' ? 'bg-green-100 text-green-800' :
                                rec.estatus === 'cancelado' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {rec.estatus}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {rec.estatus === 'pendiente' && (
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleSendReminder(rec.id)} title="Registrar Envío">
                                    <Send className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="default" onClick={() => handleMarkCompleted(rec.id)} title="Marcar Completado">
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
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

export default RecordatoriosPage;