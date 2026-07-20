import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useDRVReports } from '@/hooks/useDRVReports.js';
import { useDRVs } from '@/hooks/useDRVs.js';
import { Download, Filter } from 'lucide-react';

const DRVReportsPage = () => {
  const { generateReport, exportToCSV, loading } = useDRVReports();
  const { fetchDRVs } = useDRVs();
  
  const [drvs, setDrvs] = useState([]);
  const [filters, setFilters] = useState({ drv_id: 'all', estado_registro: 'all', startDate: '', endDate: '' });
  const [columns, setColumns] = useState(['registro_id', 'drv_id', 'fecha', 'hora', 'valor_inicial', 'valor_final', 'corte', 'estado', 'usuario']);

  useEffect(() => {
    fetchDRVs().then(res => { if (res.success) setDrvs(res.data); });
  }, []);

  const handleExport = async () => {
    const queryFilters = { ...filters };
    if (queryFilters.drv_id === 'all') delete queryFilters.drv_id;
    if (queryFilters.estado_registro === 'all') delete queryFilters.estado_registro;
    
    const res = await generateReport(queryFilters);
    if (res.success) {
      exportToCSV(res.data, columns);
    }
  };

  return (
    <>
      <Helmet><title>Reportes DRV - Gas Victoria</title></Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg"><Filter className="w-6 h-6 text-primary" /></div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reportes de Descargas DRV</h1>
              <p className="text-muted-foreground">Genera y exporta reportes detallados en CSV</p>
            </div>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardHeader className="bg-muted/20 border-b border-border/50">
              <CardTitle>Filtros del Reporte</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dispositivo DRV</label>
                  <Select value={filters.drv_id} onValueChange={(v) => setFilters({...filters, drv_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los dispositivos</SelectItem>
                      {drvs.map(d => <SelectItem key={d.id} value={d.id}>{d.drv_id} - {d.marca}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado del Registro</label>
                  <Select value={filters.estado_registro} onValueChange={(v) => setFilters({...filters, estado_registro: v})}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Confirmado">Confirmado</SelectItem>
                      <SelectItem value="Corte Aplicado">Corte Aplicado</SelectItem>
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
                <Button onClick={handleExport} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? 'Generando...' : 'Exportar a CSV'}
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

export default DRVReportsPage;