import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx';
import { Edit, Trash2, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

const DRVReadingsList = ({ drvId, readings, loading, onDelete, onApplyCut }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!readings?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl bg-muted/20">
        <div className="bg-muted p-4 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No hay registros</h3>
        <p className="text-muted-foreground mb-6">Añade el primer registro para este DRV</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Corte Aplicado': return <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">Aplicado</span>;
      case 'Confirmado': return <span className="px-2 py-1 bg-accent/20 text-accent-foreground text-xs font-semibold rounded-full">Confirmado</span>;
      default: return <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">Pendiente</span>;
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Fecha / Hora</TableHead>
            <TableHead>Valores</TableHead>
            <TableHead>Corte</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((reg) => (
            <TableRow key={reg.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="font-medium">{reg.fecha_captura ? new Date(reg.fecha_captura).toLocaleDateString() : '-'}</div>
                <div className="text-xs text-muted-foreground">{reg.hora_captura}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm font-mono text-muted-foreground">In: {reg.valor_inicial?.toFixed(2)}</div>
                <div className="text-sm font-mono font-medium">Fin: {reg.valor_final?.toFixed(2)}</div>
              </TableCell>
              <TableCell className="font-mono font-bold text-primary">{reg.corte?.toFixed(2)}</TableCell>
              <TableCell>{getStatusBadge(reg.estado_registro)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {reg.expand?.usuario_responsable?.name || 'Desconocido'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1.5 flex-wrap">
                  <Link to={`/drv/${drvId}/registros/${reg.id}/evidencias`}>
                    <Button variant="outline" size="sm" className="h-8 hover:bg-accent">
                      <Camera className="w-3.5 h-3.5 mr-1" /> Evidencias
                    </Button>
                  </Link>

                  {reg.estado_registro === 'Pendiente' && (
                    <>
                      <Link to={`/drv/${drvId}/registros/${reg.id}/editar`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-primary">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar Registro</AlertDialogTitle>
                            <AlertDialogDescription>¿Está seguro de eliminar este registro? Esto también eliminará las evidencias asociadas.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(reg.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button 
                        size="sm" 
                        onClick={() => onApplyCut(reg.id)} 
                        className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aplicar Corte
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DRVReadingsList;