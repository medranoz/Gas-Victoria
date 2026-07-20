import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as XLSX from 'xlsx';
import { ArrowLeft, Search, Download, History, DatabaseZap } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { useTanqueAPI } from '@/hooks/useTanqueAPI.js';
import { useCorteAPI } from '@/hooks/useCorteAPI.js';

const HistorialCortesPage = () => {
  const { id } = useParams();
  const { getTanque } = useTanqueAPI();
  const { listCortes } = useCorteAPI();
  
  const [tanque, setTanque] = useState(null);
  const [cortes, setCortes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!tanque) {
        const t = await getTanque(id);
        setTanque(t);
      }
      
      let filterExtras = [];
      if (startDate) filterExtras.push(`created >= "${startDate} 00:00:00"`);
      if (endDate) filterExtras.push(`created <= "${endDate} 23:59:59"`);
      
      const filterStr = filterExtras.join(' && ');
      
      const cuts = await listCortes(id, filterStr, 1, 100);
      setCortes(cuts.items);
    } catch (error) {
      console.error("Error loading history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getTanque, listCortes, startDate, endDate]);

  const handleExportCSV = () => {
    if (cortes.length === 0) return;
    const exportData = cortes.map(c => ({
      'Fecha': new Date(c.created).toLocaleString(),
      'Carga Inicial (%)': c.carga_inicial_porcentaje,
      'Carga Autorizada': `${c.autorizacion_carga_valor} ${c.autorizacion_carga_tipo === 'Porcentaje' ? '%' : 'L'}`,
      'Carga Final (%)': c.carga_final_porcentaje,
      'Volumen (L)': c.carga_disponible_litros_final,
      'Faltante (L)': c.carga_faltante_final,
      'Estado': c.estado_corte,
      'Usuario': c.expand?.usuario_corte?.email || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial_Cortes");
    XLSX.writeFile(wb, `Cortes_${tanque?.numero_tanque}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Historial de Cortes - Gas Victoria</title></Helmet>
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <Button variant="ghost" asChild className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <Link to={tanque ? `/carga/detalle/${id}` : '/carga'}><ArrowLeft className="w-4 h-4 mr-2" /> Volver</Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary border border-secondary/20 hidden sm:block">
              <History className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Historial de Cortes</h1>
              <p className="text-muted-foreground mt-1">
                {tanque ? `Tanque: ${tanque.numero_tanque} | Registro de cargas y autorizaciones` : 'Cargando información...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportCSV} disabled={loading || cortes.length === 0} className="h-11">
              <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm mb-6 p-4 flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Desde</Label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="h-10 w-full sm:w-[150px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hasta</Label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="h-10 w-full sm:w-[150px]"
            />
          </div>
          <div className="mt-5">
            <Button variant="ghost" onClick={() => {setStartDate(''); setEndDate('');}} className="h-10 text-muted-foreground">
              Limpiar Filtros
            </Button>
          </div>
        </div>

        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">Fecha y Hora</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">CIni %</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Autorización</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">CFin %</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Volumen Final</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Estado</TableHead>
                  <TableHead className="font-semibold text-foreground">Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : cortes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No hay registros de cortes para este tanque en el rango seleccionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  cortes.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-sm whitespace-nowrap">
                        {new Date(c.created).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center font-technical">{c.carga_inicial_porcentaje?.toFixed(2)}%</TableCell>
                      <TableCell className="text-center font-technical font-medium text-primary">
                        +{c.autorizacion_carga_valor} {c.autorizacion_carga_tipo === 'Porcentaje' ? '%' : 'L'}
                      </TableCell>
                      <TableCell className="text-center font-technical font-bold">{c.carga_final_porcentaje?.toFixed(2)}%</TableCell>
                      <TableCell className="text-right font-technical">{c.carga_disponible_litros_final?.toLocaleString()} L</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`uppercase ${c.estado_corte === 'Autorizado' ? 'bg-primary/10 text-primary border-primary/20' : ''}`}>
                          {c.estado_corte}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">
                        {c.expand?.usuario_corte?.email}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default HistorialCortesPage;