import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx';
import { Edit, Trash2, Gauge, Scissors } from 'lucide-react';

const DRVsList = ({ drvs, loading, onDelete }) => {
  if (loading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>;
  }

  if (!drvs?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl bg-muted/20">
        <div className="bg-muted p-4 rounded-full mb-4"><Gauge className="w-8 h-8 text-muted-foreground" /></div>
        <h3 className="text-xl font-semibold mb-2">No hay DRVs registrados</h3>
        <p className="text-muted-foreground mb-6">Comienza registrando un nuevo dispositivo DRV</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>DRV ID</TableHead>
            <TableHead>Marca / Modelo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Valor Inicial (VI)</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drvs.map((drv) => (
            <TableRow key={drv.id} className="hover:bg-muted/30">
              <TableCell className="font-semibold">{drv.drv_id}</TableCell>
              <TableCell>
                <div className="font-medium">{drv.marca}</div>
                <div className="text-sm text-muted-foreground">{drv.modelo}</div>
              </TableCell>
              <TableCell>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${drv.estado === 'activo' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {drv.estado.toUpperCase()}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono font-medium">{drv.vi_actual?.toFixed(4)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link to={`/drv/cortes`}>
                    <Button variant="outline" size="sm" className="hover:bg-accent">
                      <Scissors className="w-4 h-4 mr-1.5" /> Registrar Corte
                    </Button>
                  </Link>
                  <Link to={`/drv/editar/${drv.id}`}>
                    <Button variant="ghost" size="sm" className="hover:text-primary"><Edit className="w-4 h-4" /></Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar DRV?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción eliminará el DRV {drv.drv_id} permanentemente.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(drv.id)} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DRVsList;