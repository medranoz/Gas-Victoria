import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Plus, Calculator, Calendar, RefreshCw } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useVentas } from '@/hooks/useVentas.js';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';

const VentasPage = () => {
  const { fetchVentas, fetchClientes, fetchZonasRutas, fetchDespachadores, fetchCostosZonas } = useVentas();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data states
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [despachadores, setDespachadores] = useState([]);
  const [costosZonas, setCostosZonas] = useState([]);

  // Form states
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedZona, setSelectedZona] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [selectedDespachador, setSelectedDespachador] = useState('');
  const [notas, setNotas] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    const [ventasData, clientesData, zonasData, despachadoresData, costosData] = await Promise.all([
      fetchVentas(), fetchClientes(), fetchZonasRutas(), fetchDespachadores(), fetchCostosZonas()
    ]);
    setVentas(ventasData);
    setClientes(clientesData);
    setZonas(zonasData);
    setDespachadores(despachadoresData);
    setCostosZonas(costosData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCostoRecord = useMemo(() => {
    if (!selectedZona) return null;
    return costosZonas.find(c => c.zona_ruta === selectedZona) || null;
  }, [selectedZona, costosZonas]);

  const costoPorUnidad = currentCostoRecord?.costo || 0;
  const unidadMedida = currentCostoRecord?.unidad_medida || '';
  const montoTotal = cantidad && !isNaN(cantidad) ? parseFloat(cantidad) * costoPorUnidad : 0;

  const handleCreateVenta = async (e) => {
    e.preventDefault();
    
    if (!selectedCliente || !selectedZona || !cantidad || !selectedDespachador || !fecha) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const cantNum = parseFloat(cantidad);
    if (isNaN(cantNum) || cantNum <= 0) {
      toast.error('Por favor ingresa una cantidad válida');
      return;
    }

    if (!currentCostoRecord) {
      toast.error('No hay costo configurado para esta zona.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        cliente: selectedCliente,
        zona_ruta: selectedZona,
        cantidad: cantNum,
        unidad_medida: unidadMedida,
        costo_por_unidad: costoPorUnidad,
        monto_total: montoTotal,
        despachador: selectedDespachador,
        fecha: fecha,
        notas: notas,
        estado: estado
      };

      await pb.collection('ventas').create(payload, { $autoCancel: false });
      toast.success('Venta creada exitosamente.');
      
      resetForm();
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error creating venta:', error);
      toast.error('Ocurrió un error al guardar la venta.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCliente(''); setSelectedZona(''); setCantidad('');
    setSelectedDespachador(''); setNotas('');
    setEstado('pendiente'); setFecha(new Date().toISOString().split('T')[0]);
  };

  const getClienteName = (id) => clientes.find(c => c.id === id)?.nombre || 'Desconocido';
  const getZonaName = (id) => zonas.find(z => z.id === id)?.nombre || 'Desconocida';
  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);

  const getEstadoBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado': return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Completado</span>;
      case 'cancelado': return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">Cancelado</span>;
      default: return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pendiente</span>;
    }
  };

  return (
    <>
      <Helmet><title>Ventas | Sistema Gas</title></Helmet>
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Ventas</h1>
              <p className="text-muted-foreground mt-1">Registra y monitorea las ventas de combustible.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={loadData} disabled={loading} size="icon">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" />Nueva Venta</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar Nueva Venta</DialogTitle>
                    <DialogDescription>Ingresa los detalles para registrar una venta en el sistema.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateVenta} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Cliente <span className="text-destructive">*</span></Label>
                        <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                          <SelectTrigger><SelectValue placeholder="Selecciona un cliente..." /></SelectTrigger>
                          <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Zona / Ruta <span className="text-destructive">*</span></Label>
                        <Select value={selectedZona} onValueChange={setSelectedZona}>
                          <SelectTrigger><SelectValue placeholder="Selecciona una zona..." /></SelectTrigger>
                          <SelectContent>{zonas.map(z => <SelectItem key={z.id} value={z.id}>{z.nombre}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Cantidad ({unidadMedida ? (unidadMedida === 'litro' ? 'Litros' : 'Kilogramos') : 'Unidad'}) <span className="text-destructive">*</span></Label>
                        <Input type="number" step="0.01" min="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                      </div>
                      <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/10 flex flex-col justify-center">
                        <Label className="text-primary font-semibold flex items-center gap-2"><Calculator className="h-4 w-4" /> Resumen de Costo</Label>
                        <div className="mt-2 text-sm flex justify-between"><span className="text-muted-foreground">Costo Unitario:</span><span className="font-medium">{formatCurrency(costoPorUnidad)}</span></div>
                        <div className="pt-2 mt-2 border-t border-primary/10 flex justify-between items-center"><span className="font-semibold text-primary">Monto Total:</span><span className="text-xl font-bold text-primary">{formatCurrency(montoTotal)}</span></div>
                      </div>
                      <div className="space-y-2">
                        <Label>Despachador <span className="text-destructive">*</span></Label>
                        <Select value={selectedDespachador} onValueChange={setSelectedDespachador}>
                          <SelectTrigger><SelectValue placeholder="Selecciona un despachador..." /></SelectTrigger>
                          <SelectContent>{despachadores.map(d => <SelectItem key={d.id} value={d.id}>{d.email}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="pl-10" />
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Estado de la Venta <span className="text-destructive">*</span></Label>
                        <Select value={estado} onValueChange={setEstado}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="completado">Completado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Notas u Observaciones (Opcional)</Label>
                        <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className="resize-none" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancelar</Button>
                      <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Confirmar Venta'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="bg-card">
              <CardTitle>Historial de Operaciones</CardTitle>
              <CardDescription>Visualiza las ventas registradas recientemente.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
              ) : ventas.length === 0 ? (
                <div className="p-12 text-center"><p className="text-muted-foreground">No hay ventas registradas.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Zona/Ruta</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ventas.map((v) => (
                        <TableRow key={v.id} className="hover:bg-muted/30">
                          <TableCell className="text-sm text-muted-foreground">{v.fecha || v.created?.split(' ')[0]}</TableCell>
                          <TableCell className="font-medium">{v.cliente ? getClienteName(v.cliente) : 'N/A'}</TableCell>
                          <TableCell>{v.zona_ruta ? getZonaName(v.zona_ruta) : 'N/A'}</TableCell>
                          <TableCell className="text-right font-medium">{v.cantidad || 0}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(v.monto_total)}</TableCell>
                          <TableCell className="text-center">{getEstadoBadge(v.estado || v.estatus)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default VentasPage;