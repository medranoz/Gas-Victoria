import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';
import { getIcon } from '@/lib/iconMap.js';
import { Edit, Eye, Database, CheckCircle2, AlertTriangle, XCircle, Wrench } from 'lucide-react';

const ModuleTable = ({ modules, onEdit, onViewDetails, onRepair, getIntegrity }) => {
  if (!modules || modules.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <p className="text-muted-foreground">No se encontraron módulos con los filtros actuales.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-16">Orden</TableHead>
            <TableHead>Módulo</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Colecciones</TableHead>
            <TableHead>Integridad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((mod) => {
            const Icon = getIcon(mod.icono);
            const integrity = getIntegrity ? getIntegrity(mod) : { status: 'valid', issues: [] };
            
            const rowClass = integrity.status === 'error' 
              ? 'bg-destructive/5 hover:bg-destructive/10' 
              : integrity.status === 'warning' 
                ? 'bg-yellow-500/5 hover:bg-yellow-500/10' 
                : '';

            return (
              <TableRow key={mod.id} className={rowClass}>
                <TableCell className="font-medium text-center">{mod.orden}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground">{mod.nombre}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{mod.ubicacion}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
                    {mod.colecciones && mod.colecciones.length > 0 ? (
                      <>
                        <Database className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">{mod.colecciones.length} asoc.</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Ninguna</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          {integrity.status === 'valid' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                          {integrity.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                          {integrity.status === 'error' && <XCircle className="w-5 h-5 text-destructive" />}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className={integrity.status !== 'valid' ? 'border-destructive' : ''}>
                        {integrity.status === 'valid' ? 'Configuración íntegra' : (
                          <div className="space-y-1">
                            <p className="font-semibold">{integrity.status === 'error' ? 'Errores críticos:' : 'Advertencias:'}</p>
                            <ul className="list-disc pl-4 text-xs">
                              {integrity.issues.map((i, idx) => <li key={idx}>{i}</li>)}
                            </ul>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge variant={mod.estado ? 'default' : 'secondary'} className={mod.estado ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20' : ''}>
                    {mod.estado ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {integrity.status !== 'valid' && (
                      <Button variant="ghost" size="icon" className="text-yellow-600 hover:bg-yellow-500/10" onClick={() => onRepair && onRepair(mod)} title="Reparar problemas">
                        <Wrench className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails && onViewDetails(mod, integrity)} title="Ver detalles">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(mod)} title="Editar configuración">
                      <Edit className="w-4 h-4 text-primary" />
                    </Button>
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

export default ModuleTable;