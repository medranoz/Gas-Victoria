import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog.jsx';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const ProviderTable = ({ providers, onEdit, onDelete, isLoading }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (provider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!providerToDelete) return;

    setIsDeleting(true);
    try {
      await pb.collection('proveedores').delete(providerToDelete.id, { $autoCancel: false });
      toast.success('Proveedor eliminado correctamente');
      onDelete();
      setDeleteDialogOpen(false);
      setProviderToDelete(null);
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('Error al eliminar el proveedor');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Trash2 className="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay proveedores registrados</h3>
        <p className="text-sm text-muted-foreground">
          Comienza agregando tu primer proveedor usando el botón "Nuevo proveedor"
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Razón social</TableHead>
                <TableHead className="font-semibold">Dirección</TableHead>
                <TableHead className="font-semibold">Teléfono</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Observaciones</TableHead>
                <TableHead className="text-right font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {provider.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium">{provider.razon_social}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {provider.direccion || <span className="italic text-muted-foreground/60">Sin dirección</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {provider.telefono || <span className="italic text-muted-foreground/60">Sin teléfono</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {provider.email || <span className="italic text-muted-foreground/60">Sin email</span>}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {provider.observaciones || <span className="italic text-muted-foreground/60">Sin observaciones</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(provider)}
                        className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(provider)}
                        className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el proveedor{' '}
              <span className="font-semibold text-foreground">{providerToDelete?.razon_social}</span>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProviderTable;