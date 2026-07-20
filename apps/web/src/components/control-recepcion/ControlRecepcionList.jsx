import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx';
import { Eye, Edit, Trash2, Search, FileText } from 'lucide-react';
import DownloadPDFButton from './DownloadPDFButton.jsx';

const ControlRecepcionList = ({ registros, loading, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = registros.filter(r => {
    const matchesSearch = r.folio?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.expand?.estacion_id?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.expand?.proveedor_id?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.estado_registro === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-3 mt-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Confirmado': return 'bg-primary/10 text-primary';
      case 'Previsualizado': return 'bg-accent/20 text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por folio, estación o proveedor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Borrador">Borrador</SelectItem>
            <SelectItem value="Previsualizado">Previsualizado</SelectItem>
            <SelectItem value="Confirmado">Confirmado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!filtered.length ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl bg-muted/20">
          <div className="bg-muted p-4 rounded-full mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No hay registros</h3>
          <p className="text-muted-foreground mb-6">No se encontraron controles de recepción.</p>
        </div>
      ) : (
        <div className="border rounded-xl shadow-sm bg-card overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="whitespace-nowrap">Folio / Fecha</TableHead>
                <TableHead className="whitespace-nowrap">Estación / Proveedor</TableHead>
                <TableHead className="whitespace-nowrap" title="Capacidad Total (Lts)">CT</TableHead>
                <TableHead className="whitespace-nowrap" title="Capacidad Permitida (Lts)">CP</TableHead>
                <TableHead className="whitespace-nowrap" title="DRV Inicial (Lts)">DRV (LTi)</TableHead>
                <TableHead className="whitespace-nowrap" title="DRV Final (Lts)">DRV (LTf)</TableHead>
                <TableHead className="whitespace-nowrap" title="Diferencia DRV (Lts)">Diferencia DRV (DifLT)</TableHead>
                <TableHead className="whitespace-nowrap" title="MAGNETEL Inicial (%)">MAGNETEL (CDi)</TableHead>
                <TableHead className="whitespace-nowrap" title="MAGNETEL Final (%)">MAGNETEL (CDf)</TableHead>
                <TableHead className="whitespace-nowrap" title="Diferencia Magnetel (%)">Diferencia Magnetel (DifCD)</TableHead>
                <TableHead className="whitespace-nowrap">Estado</TableHead>
                <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="whitespace-nowrap">
                    <div className="font-mono text-sm font-semibold">{r.folio}</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.fecha_hora).toLocaleDateString()} {new Date(r.fecha_hora).toLocaleTimeString()}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                    <div className="font-medium text-sm truncate" title={r.expand?.estacion_id?.nombre}>{r.expand?.estacion_id?.nombre || '-'}</div>
                    <div className="text-xs text-muted-foreground truncate" title={r.expand?.proveedor_id?.razon_social}>{r.expand?.proveedor_id?.razon_social || '-'}</div>
                  </TableCell>
                  
                  <TableCell className="font-mono text-xs whitespace-nowrap">{r.capacidad_total_ct !== undefined && r.capacidad_total_ct !== null ? r.capacidad_total_ct.toFixed(2) : '-'}</TableCell>
                  <TableCell className="font-mono text-xs whitespace-nowrap">{r.capacidad_permitida_cp !== undefined && r.capacidad_permitida_cp !== null ? r.capacidad_permitida_cp.toFixed(2) : '-'}</TableCell>
                  <TableCell className="font-mono text-xs whitespace-nowrap">{r.litraje_inicial_lti !== undefined && r.litraje_inicial_lti !== null ? r.litraje_inicial_lti.toFixed(2) : '-'}</TableCell>
                  <TableCell className="font-mono text-xs whitespace-nowrap">{r.litraje_final_ltf !== undefined && r.litraje_final_ltf !== null ? r.litraje_final_ltf.toFixed(2) : '-'}</TableCell>
                  <TableCell className="font-mono text-xs font-bold text-primary whitespace-nowrap">{r.diferencia_litraje_diflt !== undefined && r.diferencia_litraje_diflt !== null ? r.diferencia_litraje_diflt.toFixed(2) : '-'}</TableCell>
                  
                  <TableCell className="font-mono text-xs whitespace-nowrap">{r.capacidad_disponible_inicial_cdi !== undefined && r.capacidad_disponible_inicial_cdi !== null ? r.capacidad_disponible_inicial_cdi.toFixed(2) : '-'}</TableCell>
                  <TableCell className="font-mono text-xs whitespace-nowrap">{r.capacidad_disponible_final_cdf !== undefined && r.capacidad_disponible_final_cdf !== null ? r.capacidad_disponible_final_cdf.toFixed(2) : '-'}</TableCell>
                  <TableCell className="font-mono text-xs font-bold text-primary whitespace-nowrap">{r.diferencia_capacidad_difcd !== undefined && r.diferencia_capacidad_difcd !== null ? r.diferencia_capacidad_difcd.toFixed(2) : '-'}</TableCell>

                  <TableCell className="whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold tracking-wide ${getBadgeStyle(r.estado_registro)}`}>
                      {r.estado_registro}
                    </span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1 flex-wrap">
                      <Link to={`/control-recepcion/${r.id}/previsualizar`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      {r.estado_registro !== 'Confirmado' && (
                        <Link to={`/control-recepcion/${r.id}/editar`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-primary">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}

                      <DownloadPDFButton record={r} variant="ghost" className="h-8 w-8 p-0" />

                      {r.estado_registro !== 'Confirmado' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar Registro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará el registro de recepción y no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(r.id)} className="bg-destructive text-destructive-foreground">
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ControlRecepcionList;