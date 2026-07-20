import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Edit, Trash2, Truck, RefreshCw, Eye, BellRing, CalendarClock } from 'lucide-react';

const ATQsList = ({ atqs, loading, onDelete, onReactivate, onRefresh }) => {
  const [processingId, setProcessingId] = useState(null);

  const handleDelete = async (id) => {
    setProcessingId(id);
    await onDelete(id);
    setProcessingId(null);
    onRefresh();
  };

  const handleReactivate = async (id) => {
    setProcessingId(id);
    await onReactivate(id);
    setProcessingId(null);
    onRefresh();
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center p-4 border rounded-lg bg-card">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!atqs || atqs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-t bg-muted/10">
        <div className="bg-muted p-4 rounded-full mb-4 shadow-sm">
          <Truck className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No se encontraron ATQs</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Ajusta los filtros de búsqueda o comienza creando un nuevo registro de autotanque.
        </p>
        <Link to="/atqs/crear">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95">
            Registrar ATQ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">ATQ / Placa</TableHead>
            <TableHead className="font-semibold text-foreground">Reg. Contable</TableHead>
            <TableHead className="font-semibold text-foreground">Vehículo</TableHead>
            <TableHead className="font-semibold text-foreground">Rol</TableHead>
            <TableHead className="font-semibold text-foreground">Estado</TableHead>
            <TableHead className="font-semibold text-foreground">Mantenimiento</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {atqs.map((atq) => {
            const isMaintClose = atq.fecha_mantenimiento && new Date(atq.fecha_mantenimiento) <= new Date(Date.now() + 7 * 86400000);
            const isMaintPast = atq.fecha_mantenimiento && new Date(atq.fecha_mantenimiento) < new Date();

            return (
              <TableRow key={atq.id} className={`hover:bg-muted/30 transition-colors ${!atq.activo ? 'bg-muted/10 opacity-75' : ''}`}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      {atq.atq_id}
                      {!atq.activo && <Badge variant="secondary" className="text-[10px] tracking-wide uppercase px-1.5 py-0">Inactivo</Badge>}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground bg-muted w-fit px-1.5 rounded">{atq.placa}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <span className="font-mono">{atq.registro_contable || '-'}</span>
                </TableCell>
                <TableCell className="text-foreground">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{atq.marca} {atq.modelo}</span> 
                    <span className="text-muted-foreground text-xs font-mono">{atq.niv.substring(0,8)}...</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={atq.rol_tanque === 'DE TRASPASO' ? 'border-primary/50 text-primary bg-primary/5 font-normal' : 'border-secondary/50 text-secondary-foreground bg-secondary/5 font-normal'}>
                    {atq.rol_tanque || '-'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={
                      atq.estado_actual === 'ACTIVO' ? 'border-green-500/50 text-green-600 bg-green-500/5 font-normal' : 
                      atq.estado_actual === 'EN MANTENIMIENTO' ? 'border-amber-500/50 text-amber-600 bg-amber-500/5 font-normal' : 
                      'border-destructive/50 text-destructive bg-destructive/5 font-normal'
                    }
                  >
                    {atq.estado_actual || '-'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {atq.fecha_mantenimiento ? (
                    <div className="flex flex-col gap-1.5">
                      <span className={`text-xs flex items-center gap-1 ${isMaintPast ? 'text-destructive font-medium' : isMaintClose ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                        <CalendarClock className="w-3 h-3" />
                        {new Date(atq.fecha_mantenimiento).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                      </span>
                      {atq.notificacion_mantenimiento && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 w-fit bg-blue-500/10 text-blue-600 border-blue-500/20 font-normal">
                          <BellRing className="w-2.5 h-2.5 mr-1" /> Notificando
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50 text-xs italic">No programado</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    {atq.activo ? (
                      <>
                        <Link to={`/atqs/detalle/${atq.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" title="Ver Detalles">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/atqs/editar/${atq.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" title="Editar">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors" disabled={processingId === atq.id} title="Desactivar">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-xl border-border/50">
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Desactivar ATQ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción marcará el ATQ <span className="font-semibold text-foreground">{atq.atq_id}</span> como inactivo y no podrá ser utilizado hasta reactivarlo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="hover:bg-muted">Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(atq.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Desactivar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <>
                        <Link to={`/atqs/detalle/${atq.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" title="Ver Detalles">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => handleReactivate(atq.id)} disabled={processingId === atq.id} className="h-8 hover:bg-green-500/10 hover:text-green-600 transition-colors">
                          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${processingId === atq.id ? 'animate-spin' : ''}`} /> Reactivar
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ATQsList;