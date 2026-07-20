import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Download, Filter, RefreshCw, BarChart3, PieChart as PieChartIcon, TrendingUp, Droplets, DollarSign, Scale } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const ReportesPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ventas, setVentas] = useState([]);
  const [tanques, setTanques] = useState([]);
  const [zonas, setZonas] = useState([]);
  
  const [filters, setFilters] = useState({
    tanque: 'all',
    zona: 'all',
    fechaDesde: '',
    fechaHasta: '',
    estatus: {
      por_surtir: true,
      surtido: true,
      liquidado: true,
      cancelado: true
    }
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [tanquesData, zonasData] = await Promise.all([
        pb.collection('tanques').getFullList({ sort: 'numero_tanque', $autoCancel: false }),
        pb.collection('zonas_rutas').getFullList({ sort: 'nombre', $autoCancel: false })
      ]);
      setTanques(tanquesData);
      setZonas(zonasData);
      
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      
      setFilters(prev => ({
        ...prev,
        fechaDesde: firstDay,
        fechaHasta: lastDay
      }));
      
    } catch (error) {
      toast.error('Error al cargar datos iniciales');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.fechaDesde && filters.fechaHasta) {
      fetchReportData();
    }
  }, [filters.fechaDesde, filters.fechaHasta]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let filterConditions = [];

      if (filters.tanque !== 'all') {
        filterConditions.push(`tanque = "${filters.tanque}"`);
      }

      if (filters.zona !== 'all') {
        filterConditions.push(`zona_ruta = "${filters.zona}"`);
      }

      if (filters.fechaDesde) {
        filterConditions.push(`fecha >= "${filters.fechaDesde}"`);
      }

      if (filters.fechaHasta) {
        const nextDay = new Date(filters.fechaHasta);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        filterConditions.push(`fecha < "${nextDayStr}"`);
      }

      const activeStatus = Object.entries(filters.estatus)
        .filter(([_, isActive]) => isActive)
        .map(([status]) => `estatus = "${status}"`);
      
      if (activeStatus.length > 0) {
        filterConditions.push(`(${activeStatus.join(' || ')})`);
      } else {
        setVentas([]);
        setLoading(false);
        return;
      }

      const filterString = filterConditions.join(' && ');

      const records = await pb.collection('ventas').getFullList({
        filter: filterString,
        sort: '-fecha',
        expand: 'cliente,despachador,tanque,zona_ruta',
        $autoCancel: false
      });

      setVentas(records);
      toast.success(`Se encontraron ${records.length} registros`);
    } catch (error) {
      toast.error('Error al generar reporte');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleStatusChange = (status, checked) => {
    setFilters(prev => ({
      ...prev,
      estatus: {
        ...prev.estatus,
        [status]: checked
      }
    }));
  };

  const resetFilters = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    setFilters({
      tanque: 'all',
      zona: 'all',
      fechaDesde: firstDay,
      fechaHasta: lastDay,
      estatus: {
        por_surtir: true,
        surtido: true,
        liquidado: true,
        cancelado: true
      }
    });
  };

  const exportToExcel = () => {
    if (ventas.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const exportData = ventas.map(v => ({
      'Fecha': v.fecha ? new Date(v.fecha).toLocaleDateString() : 'N/A',
      'Cliente': v.expand?.cliente?.nombre || 'N/A',
      'Despachador': v.expand?.despachador?.email || 'N/A',
      'Tanque': v.expand?.tanque?.numero_tanque || 'N/A',
      'Zona/Ruta': v.expand?.zona_ruta?.nombre || 'N/A',
      'Cantidad': v.cantidad || v.litros || 0,
      'Unidad': v.unidad_medida === 'kilogramo' ? 'Kilogramos' : 'Litros',
      'Costo U.': v.costo_por_unidad || v.costo_unitario || 0,
      'Monto Total': v.monto_total || 0,
      'Estatus': getStatusLabel(v.estatus),
      'Notas': v.notas || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Ventas");
    
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Reporte_GasVictoria_${dateStr}.xlsx`);
  };

  const getStatusLabel = (status) => {
    const labels = {
      por_surtir: 'Por surtir',
      surtido: 'Surtido',
      liquidado: 'Liquidado',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  const stats = useMemo(() => {
    const validVentas = ventas.filter(v => v.estatus !== 'cancelado');
    const totalVentas = ventas.length;
    
    let totalLitros = 0;
    let totalKilos = 0;
    let totalMonto = 0;

    validVentas.forEach(v => {
      const qty = v.cantidad || v.litros || 0;
      if (v.unidad_medida === 'kilogramo') {
        totalKilos += qty;
      } else {
        totalLitros += qty;
      }
      totalMonto += (v.monto_total || 0);
    });

    const ingresosByZonaMap = {};
    validVentas.forEach(v => {
      const zName = v.expand?.zona_ruta?.nombre || 'Sin zona';
      const unit = v.unidad_medida === 'kilogramo' ? ' (kg)' : ' (L)';
      const key = `${zName}${unit}`;
      ingresosByZonaMap[key] = (ingresosByZonaMap[key] || 0) + (v.monto_total || 0);
    });
    const ingresosByZona = Object.entries(ingresosByZonaMap).map(([name, value]) => ({ name, value }));

    const salesByZonaMap = {};
    validVentas.forEach(v => {
      const zName = v.expand?.zona_ruta?.nombre || 'Sin zona';
      salesByZonaMap[zName] = (salesByZonaMap[zName] || 0) + 1;
    });
    const salesByZona = Object.entries(salesByZonaMap).map(([name, value]) => ({ name, value }));

    return {
      totalVentas,
      totalLitros,
      totalKilos,
      totalMonto,
      ingresosByZona,
      salesByZona
    };
  }, [ventas]);

  return (
    <>
      <Helmet>
        <title>Reportes - Gas Victoria</title>
        <meta name="description" content="Reportes avanzados y estadísticas de ventas." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 bg-muted/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Reportes y Estadísticas</h1>
                <p className="text-muted-foreground">Analiza el rendimiento de tu distribuidora</p>
              </div>
              <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white" disabled={ventas.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exportar a Excel
              </Button>
            </div>

            <Card className="mb-8 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filtros Avanzados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label>Período Desde</Label>
                    <Input 
                      type="date" 
                      value={filters.fechaDesde} 
                      onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                      className="text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Período Hasta</Label>
                    <Input 
                      type="date" 
                      value={filters.fechaHasta} 
                      onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                      className="text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanque</Label>
                    <Select value={filters.tanque} onValueChange={(v) => handleFilterChange('tanque', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tanques" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tanques</SelectItem>
                        {tanques.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.numero_tanque}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Zona / Ruta</Label>
                    <Select value={filters.zona} onValueChange={(v) => handleFilterChange('zona', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las zonas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las zonas</SelectItem>
                        {zonas.map(z => (
                          <SelectItem key={z.id} value={z.id}>{z.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6">
                  <Label className="mb-3 block">Estatus de Venta</Label>
                  <div className="flex flex-wrap gap-6">
                    {Object.entries({
                      por_surtir: 'Por surtir',
                      surtido: 'Surtido',
                      liquidado: 'Liquidado',
                      cancelado: 'Cancelado'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`status-${key}`} 
                          checked={filters.estatus[key]}
                          onCheckedChange={(checked) => handleStatusChange(key, checked)}
                        />
                        <Label htmlFor={`status-${key}`} className="cursor-pointer font-normal">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                  <Button variant="outline" onClick={resetFilters}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Limpiar Filtros
                  </Button>
                  <Button onClick={fetchReportData} disabled={loading}>
                    {loading ? 'Cargando...' : 'Aplicar Filtros'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-sm border-l-4 border-l-blue-500">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Ventas</p>
                    <h3 className="text-2xl font-bold">{stats.totalVentas}</h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-l-4 border-l-green-500">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                    <Droplets className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Litros</p>
                    <h3 className="text-2xl font-bold">{stats.totalLitros.toFixed(1)} L</h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-l-4 border-l-orange-500">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                    <Scale className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Kilogramos</p>
                    <h3 className="text-2xl font-bold">{stats.totalKilos.toFixed(1)} kg</h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-l-4 border-l-emerald-500">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monto Total Vendido</p>
                    <h3 className="text-2xl font-bold">${stats.totalMonto.toFixed(2)}</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Ingresos por Zona y Unidad</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {stats.ingresosByZona.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.ingresosByZona} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Ingresos']} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">Sin datos</div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Distribución de Ventas por Zona</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {stats.salesByZona.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.salesByZona}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.salesByZona.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">Sin datos</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Resultados Detallados</CardTitle>
              </CardHeader>
              <CardContent>
                {ventas.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No se encontraron registros con los filtros actuales</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Zona</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead>Unidad</TableHead>
                          <TableHead className="text-right">Costo U.</TableHead>
                          <TableHead className="text-right">Monto Total</TableHead>
                          <TableHead>Estatus</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ventas.map((venta) => (
                          <TableRow key={venta.id}>
                            <TableCell>{venta.fecha ? new Date(venta.fecha).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="font-medium">{venta.expand?.cliente?.nombre || 'N/A'}</TableCell>
                            <TableCell>{venta.expand?.zona_ruta?.nombre || 'N/A'}</TableCell>
                            <TableCell className="text-right font-medium">{venta.cantidad || venta.litros || 0}</TableCell>
                            <TableCell className="capitalize">{venta.unidad_medida === 'kilogramo' ? 'kg' : 'L'}</TableCell>
                            <TableCell className="text-right text-muted-foreground">${(venta.costo_por_unidad || venta.costo_unitario || 0).toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium text-green-600">${(venta.monto_total || 0).toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                venta.estatus === 'liquidado' ? 'bg-green-100 text-green-800' :
                                venta.estatus === 'surtido' ? 'bg-blue-100 text-blue-800' :
                                venta.estatus === 'cancelado' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {getStatusLabel(venta.estatus)}
                              </span>
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

export default ReportesPage;