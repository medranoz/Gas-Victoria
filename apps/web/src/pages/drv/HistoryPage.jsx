import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import CutsTable from '@/components/drv/CutsTable.jsx';
import { useCalculateCut } from '@/hooks/useCalculateCut.js';
import { useDRVs } from '@/hooks/useDRVs.js';
import { History, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { usePDFExport } from '@/hooks/usePDFExport.js';

const HistoryPage = () => {
  const { getCutHistory, deleteCut, isLoading } = useCalculateCut();
  const { fetchDRVs } = useDRVs();
  const { generateHistoryPDF } = usePDFExport();
  
  const [cuts, setCuts] = useState([]);
  const [drvs, setDrvs] = useState([]);
  const [filters, setFilters] = useState({ drvId: 'all', startDate: '', endDate: '' });

  useEffect(() => {
    fetchDRVs().then(res => { if (res.success) setDrvs(res.data); });
  }, []);

  useEffect(() => {
    loadHistory();
  }, [filters]);

  const loadHistory = async () => {
    const data = await getCutHistory({ drvId: filters.drvId, startDate: filters.startDate, endDate: filters.endDate });
    setCuts(data.items || []);
  };

  const handleDelete = async (id) => {
    if(window.confirm('¿Eliminar este corte permanentemente?')){
      await deleteCut(id);
      loadHistory();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Historial de Cortes - Gas Victoria</title></Helmet>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl"><History className="w-6 h-6 text-primary" /></div>
            <div>
              <h1 className="text-3xl font-bold">Historial de Cortes</h1>
              <p className="text-muted-foreground">Registros históricos de cortes volumétricos</p>
            </div>
          </div>
          <Button onClick={() => generateHistoryPDF(cuts, filters)} disabled={cuts.length === 0} className="bg-primary shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Exportar Historial PDF
          </Button>
        </div>

        <div className="bg-card border p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 rounded-xl shadow-sm items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Filter className="w-3 h-3"/> DRV</label>
            <Select value={filters.drvId} onValueChange={(v) => setFilters({...filters, drvId: v})}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {drvs.map(d => <SelectItem key={d.id} value={d.id}>{d.drv_id}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Fecha Inicio</label>
            <Input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Fecha Fin</label>
            <Input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          </div>
          <Button variant="outline" onClick={() => setFilters({drvId: 'all', startDate: '', endDate: ''})}>Limpiar Filtros</Button>
        </div>

        <CutsTable cuts={cuts} isLoading={isLoading} onDelete={handleDelete} />
      </main>
      <Footer />
    </div>
  );
};

export default HistoryPage;