import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ATQsList from '@/components/atqs/ATQsList.jsx';
import { useATQs } from '@/hooks/useATQs.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Plus, Download, Search, Truck } from 'lucide-react';

const ATQsPage = () => {
  const { fetchATQs, deleteATQ, reactivateATQ, exportToCSV, loading } = useATQs();
  const [atqs, setAtqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const loadData = async () => {
    let filterStr = '';
    const conditions = [];

    if (searchQuery) {
      // Support searching by ATQ ID or Placa
      conditions.push(`(atq_id ~ "${searchQuery}" || placa ~ "${searchQuery}" || niv ~ "${searchQuery}")`);
    }

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ACTIVE') {
        conditions.push(`activo = true`);
      } else if (statusFilter === 'INACTIVE') {
        conditions.push(`activo = false`);
      } else {
        conditions.push(`estado_actual = "${statusFilter}"`);
      }
    }

    if (conditions.length > 0) {
      filterStr = conditions.join(' && ');
    }

    const res = await fetchATQs(1, 100, filterStr);
    if (res.success) {
      setAtqs(res.data.items);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, fetchATQs]);

  const handleExport = () => {
    exportToCSV(atqs);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Helmet>
        <title>Catálogo de ATQs - Gas Victoria</title>
        <meta name="description" content="Gestión y catálogo de Autotanques (ATQs)." />
      </Helmet>

      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Truck className="w-8 h-8 text-primary" />
              Gestión de Autotanques
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Administra el catálogo de ATQs, placas, mantenimiento y estados operativos.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport} disabled={loading || atqs.length === 0} className="shadow-sm">
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
            <Link to="/atqs/crear">
              <Button className="shadow-sm transition-transform active:scale-95">
                <Plus className="w-4 h-4 mr-2" /> Nuevo ATQ
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, Placa o NIV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full bg-background"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[220px] bg-background">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los Estados</SelectItem>
              <SelectItem value="ACTIVE">Solo Activos</SelectItem>
              <SelectItem value="INACTIVE">Inactivos / Deshabilitados</SelectItem>
              <SelectItem value="EN MANTENIMIENTO">En Mantenimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ATQsList 
          atqs={atqs} 
          loading={loading} 
          onDelete={deleteATQ} 
          onReactivate={reactivateATQ}
          onRefresh={loadData}
        />
      </main>

      <Footer />
    </div>
  );
};

export default ATQsPage;