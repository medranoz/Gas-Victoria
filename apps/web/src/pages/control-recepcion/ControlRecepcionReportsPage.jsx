import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useControlRecepcionReports } from '@/hooks/useControlRecepcionReports.js';
import pb from '@/lib/pocketbaseClient.js';
import { Download, Filter, FileText } from 'lucide-react';

const ControlRecepcionReportsPage = () => {
  const { generateReport, exportToCSV, loading } = useControlRecepcionReports();
  
  const [estaciones, setEstaciones] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [filters, setFilters] = useState({ estacion_id: 'all', proveedor_id: 'all', estado_registro: 'all', startDate: '', endDate: '' });
  const [columns, setColumns] = useState([
    'folio', 'fecha', 'estacion', 'proveedor', 
    'dif_tara', 'dif_presion',
    'capacidad_total_ct', 'capacidad_permitida_cp', 
    'litraje_inicial_lti', 'litraje_final_ltf', 'diferencia_litraje_diflt', 
    'capacidad_disponible_inicial_cdi', 'capacidad_disponible_final_cdf', 'diferencia_capacidad_difcd', 
    'estado'
  ]);

  useEffect(() => {
    pb.collection('estaciones').getFullList({ filter: "rol='PLANTA'" }).then(setEstaciones);
    pb.collection('proveedores').getFullList().then(setProveedores);
  }, []);

  const handleExport = async () => {
    const res = await generateReport(filters);
    if (res.success) {
      exportToCSV(res.data, columns);
    }
  };

  return (
    <>
      <Helmet><title>Reportes Control Recepción - Gas Victoria</title></Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg"><FileText className="w-6 h-6 text-primary" /></div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Reportes de Recepción</h1>
              <p className="text-muted-foreground">Filtra y exporta la información de controles de recepción a CSV.</p>
            </div>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardHeader className="bg-muted/20 border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" /> Filtros de Exportación
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estación</label>
                  <Select value={filters.estacion_id} onValueChange={(v) => setFilters({...filters, estacion_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las estaciones</SelectItem>
                      {estaciones.map(e => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Proveedor</label>
                  <Select value={filters.proveedor_id} onValueChange={(v) => setFilters({...filters, proveedor_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los proveedores</SelectItem>
                      {proveedores.map(p => <SelectItem key={p.id} value={p.id}>{p.razon_social}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={filters.estado_registro} onValueChange={(v) => setFilters({...filters, estado_registro: v})}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Borrador">Borrador</SelectItem>
                      <SelectItem value="Previsualizado">Previsualizado</SelectItem>
                      <SelectItem value="Confirmado">Confirmado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha Inicio</label>
                  <Input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha Fin</label>
                  <Input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleExport} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? 'Generando Reporte...' : 'Exportar a CSV'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ControlRecepcionReportsPage;