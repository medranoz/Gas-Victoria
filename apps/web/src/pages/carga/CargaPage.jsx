import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as XLSX from 'xlsx';
import { Search, Plus, Filter, Download, MoreHorizontal, Settings2, ShieldCheck, DatabaseZap, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { useTanqueAPI } from '@/hooks/useTanqueAPI.js';

const CargaPage = () => {
  const navigate = useNavigate();
  const { listTanques } = useTanqueAPI();
  
  const [tanques, setTanques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTanques = async () => {
    setLoading(true);
    try {
      let filters = [];
      if (statusFilter !== 'all') {
        filters.push(`estado = "${statusFilter}"`);
      }
      if (searchTerm) {
        filters.push(`(numero_tanque ~ "${searchTerm}" || drv_id.marca ~ "${searchTerm}")`);
      }
      
      const filterStr = filters.join(' && ');
      
      const data = await listTanques(filterStr, page, perPage, '-created');
      setTanques(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar tanques de carga.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTanques();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm, page, perPage]);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Activo':
        return <Badge variant="outline" className="bg-status-active capitalize border font-semibold">Activo</Badge>;
      case 'Desactivado':
        return <Badge variant="outline" className="bg-status-inactive capitalize border font-semibold">Desactivado</Badge>;
      case 'Mantenimiento':
        return <Badge variant="outline" className="bg-status-mantenimiento capitalize border font-semibold">Mantenimiento</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.info("Generando exportación...");
      let filters = [];
      if (statusFilter !== 'all') filters.push(`estado = "${statusFilter}"`);
      if (searchTerm) filters.push(`(numero_tanque ~ "${searchTerm}" || drv_id.marca ~ "${searchTerm}")`);
      const filterStr = filters.join(' && ');
      
      const data = await listTanques(filterStr, 1, 500, '-created');
      if (data.items.length === 0) {
        toast.error('No hay datos para exportar.');
        return;
      }
      
      const exportData = data.items.map(t => ({
        'Número de Tanque': t.numero_tanque,
        'Capacidad Total (L)': t.capacidad_total,
        'Capacidad Permitida (L)': t.capacidad_permitida,
        'Carga Disponible (%)': t.carga_disponible_inicial || 0,
        'Carga Disponible (L)': t.carga_disponible_litros || 0,
        'Carga Faltante (L)': t.carga_faltante || 0,
        'Estado': t.estado,
        'DRV Vinculado': t.expand?.drv_id ? `${t.expand.drv_id.marca} ${t.expand.drv_id.modelo}` : 'N/A',
        'Origen Carga': t.origen_carga,
        'Temperatura': t.temperatura || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tanques_Carga");
      XLSX.writeFile(wb, `Tanques_Carga_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Exportación completada.");
    } catch (err) {
      toast.error("Error al exportar.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet>
        <title>Control de Carga - Gas Victoria</title>
      </Helmet>
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground" style={{letterSpacing: '-0.02em'}}>
              Control de Carga
            </h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
              Gestiona tanques de carga, lecturas volumétricas y autorizaciones de cortes de manera centralizada.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportCSV} disabled={loading}>
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/carga/nuevo">
                <Plus className="w-4 h-4 mr-2" /> Nuevo Tanque
              </Link>
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm mb-6 p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por número o DRV..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-11 bg-background text-foreground"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px] h-11 bg-background text-foreground">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activos</SelectItem>
                <SelectItem value="Desactivado">Desactivados</SelectItem>
                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[80px] h-11 bg-background text-foreground">
                <SelectValue placeholder="Pag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">Tanque</TableHead>
                  <TableHead className="font-semibold text-foreground">Capacidad Permitida</TableHead>
                  <TableHead className="font-semibold text-foreground">Carga Disponible</TableHead>
                  <TableHead className="font-semibold text-foreground">Carga Faltante</TableHead>
                  <TableHead className="font-semibold text-foreground">DRV</TableHead>
                  <TableHead className="font-semibold text-foreground">Estado</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : tanques.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No se encontraron tanques de carga registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  tanques.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <DatabaseZap className="w-4 h-4 text-muted-foreground" />
                          <span className="font-technical text-foreground">{t.numero_tanque}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">CT: {t.capacidad_total?.toLocaleString()} L</div>
                      </TableCell>
                      <TableCell className="font-technical">{t.capacidad_permitida?.toLocaleString() || 0} L</TableCell>
                      <TableCell>
                        <div className="font-technical font-medium">{t.carga_disponible_litros?.toLocaleString() || 0} L</div>
                        <div className="text-xs text-muted-foreground">{t.carga_disponible_inicial || 0}%</div>
                      </TableCell>
                      <TableCell className="font-technical text-destructive/80 font-medium">
                        {t.carga_faltante?.toLocaleString() || 0} L
                      </TableCell>
                      <TableCell className="text-sm">
                        {t.expand?.drv_id ? (
                          <span className="truncate max-w-[150px] inline-block" title={`${t.expand.drv_id.marca} ${t.expand.drv_id.modelo}`}>
                            {t.expand.drv_id.marca}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Sin DRV</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(t.estado)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Opciones de Tanque</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/carga/detalle/${t.id}`)}>
                              <ShieldCheck className="w-4 h-4 mr-2" /> Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/carga/cortes/${t.id}`)}>
                              <DatabaseZap className="w-4 h-4 mr-2" /> Gestionar Cortes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/carga/historial/${t.id}`)}>
                              <Search className="w-4 h-4 mr-2" /> Ver Historial
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/carga/editar/${t.id}`)}>
                              <Settings2 className="w-4 h-4 mr-2" /> Editar Tanque
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {!loading && tanques.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default CargaPage;