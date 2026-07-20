import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx';
import pb from '@/lib/pocketbaseClient.js';

const DRVSelector = ({ isOpen, onClose, onAssociate, currentDRVs = [] }) => {
  const [availableDRVs, setAvailableDRVs] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableDRVs();
      setSelectedIds(new Set());
      setSearch('');
    }
  }, [isOpen, currentDRVs]);

  const fetchAvailableDRVs = async () => {
    setIsLoading(true);
    try {
      const allDRVs = await pb.collection('drv').getFullList({
        sort: 'marca',
        $autoCancel: false
      });
      
      const currentIds = currentDRVs.map(d => d.id);
      const filtered = allDRVs.filter(d => !currentIds.includes(d.id));
      setAvailableDRVs(filtered);
    } catch (error) {
      console.error('Error fetching DRVs:', error);
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

  const filteredDRVs = availableDRVs.filter(d => 
    d.marca.toLowerCase().includes(search.toLowerCase()) || 
    d.modelo.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Asociar DRVs</DialogTitle>
          <DialogDescription>
            Selecciona los Dispositivos de Registro Volumétrico que deseas asociar a esta estación.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por marca, modelo o ID..." 
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
                <TableHead>Marca / Modelo</TableHead>
                <TableHead>VI Actual</TableHead>
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
              ) : filteredDRVs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No hay DRVs disponibles para asociar.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDRVs.map((drv) => (
                  <TableRow key={drv.id} className="cursor-pointer" onClick={() => handleToggle(drv.id)}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.has(drv.id)} 
                        onCheckedChange={() => handleToggle(drv.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{drv.marca} - {drv.modelo}</TableCell>
                    <TableCell>{drv.vi_actual?.toLocaleString()} L</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{drv.id}</TableCell>
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

export default DRVSelector;