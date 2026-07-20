import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx';
import pb from '@/lib/pocketbaseClient.js';

const TanqueSelector = ({ isOpen, onClose, onAssociate, currentTanques = [] }) => {
  const [availableTanques, setAvailableTanques] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTanques();
      setSelectedIds(new Set());
      setSearch('');
    }
  }, [isOpen, currentTanques]);

  const fetchAvailableTanques = async () => {
    setIsLoading(true);
    try {
      const allTanques = await pb.collection('tanques_carga').getFullList({
        sort: 'numero_tanque',
        filter: 'estacion_id = ""', // only fetch unassociated tanks
        $autoCancel: false
      });
      
      const currentIds = currentTanques.map(t => t.id);
      const filtered = allTanques.filter(t => !currentIds.includes(t.id));
      setAvailableTanques(filtered);
    } catch (error) {
      console.error('Error fetching tanques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return;
    setIsSubmitting(true);
    await onAssociate(Array.from(selectedIds));
    setIsSubmitting(false);
    onClose();
  };

  const filteredTanques = availableTanques.filter(t => 
    (t.numero_tanque && t.numero_tanque.toLowerCase().includes(search.toLowerCase())) || 
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Asociar Tanques</DialogTitle>
          <DialogDescription>
            Selecciona los tanques que deseas asociar a esta estación.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por número o ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Número de Tanque</TableHead>
                <TableHead>Capacidad Total</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredTanques.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No hay tanques disponibles para asociar.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTanques.map((tanque) => (
                  <TableRow key={tanque.id} className="cursor-pointer" onClick={() => handleToggle(tanque.id)}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.has(tanque.id)} 
                        onCheckedChange={() => handleToggle(tanque.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{tanque.numero_tanque}</TableCell>
                    <TableCell>{tanque.capacidad_total?.toLocaleString()} L</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{tanque.id}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={selectedIds.size === 0 || isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Asociar Seleccionados ({selectedIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TanqueSelector;