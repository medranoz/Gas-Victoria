import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { getIcon } from '@/lib/iconMap.js';
import { Edit, Trash2, CheckCircle2, AlertTriangle, XCircle, Wrench, Shield, Database } from 'lucide-react';
import { VALID_COLLECTIONS } from '@/hooks/useModulosConfig.js';

const ModuleDetailsModal = ({ module, isOpen, onClose, onEdit, onDelete, onRepair, integrity }) => {
  if (!module) return null;

  const Icon = getIcon(module.icono);
  const { status, issues } = integrity || { status: 'valid', issues: [] };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${status === 'error' ? 'bg-destructive/10 text-destructive' : status === 'warning' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-primary/10 text-primary'}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {module.nombre}
                <Badge variant={module.estado ? 'default' : 'secondary'}>
                  {module.estado ? 'Activo' : 'Inactivo'}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Detalles completos y análisis de integridad del módulo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Integrity Banner */}
          {status !== 'valid' && (
            <div className={`p-4 rounded-lg border flex gap-3 items-start ${status === 'error' ? 'bg-destructive/5 border-destructive/20 text-destructive' : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-700'}`}>
              {status === 'error' ? <XCircle className="w-5 h-5 mt-0.5" /> : <AlertTriangle className="w-5 h-5 mt-0.5" />}
              <div>
                <h4 className="font-semibold text-sm">Problemas de Integridad Detectados</h4>
                <ul className="mt-1 space-y-1">
                  {issues.map((issue, idx) => (
                    <li key={idx} className="text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> {issue}
                    </li>
                  ))}
                </ul>
              </div>
              <Button size="sm" variant="outline" className="ml-auto bg-background" onClick={() => onRepair(module)}>
                <Wrench className="w-4 h-4 mr-2" /> Reparar
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Ubicación
              </span>
              <p className="font-medium">{module.ubicacion}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Database className="w-4 h-4" /> Orden de Visualización
              </span>
              <p className="font-medium">{module.orden}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">Roles Permitidos</h4>
            <div className="flex flex-wrap gap-2">
              {module.roles_permitidos && module.roles_permitidos.length > 0 ? (
                module.roles_permitidos.map(role => (
                  <Badge key={role} variant="secondary">{role}</Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">Acceso global (Todos los roles)</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">Colecciones Asociadas</h4>
            {module.colecciones && Array.isArray(module.colecciones) && module.colecciones.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {module.colecciones.map(col => {
                  const exists = VALID_COLLECTIONS.includes(col);
                  return (
                    <div key={col} className={`flex items-center gap-2 p-2 rounded-md border ${exists ? 'bg-muted/30 border-border' : 'bg-destructive/5 border-destructive/20 text-destructive'}`}>
                      {exists ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4" />}
                      <span className="text-sm font-medium">{col}</span>
                      {!exists && <span className="text-xs ml-auto">(No encontrada)</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Este módulo no tiene colecciones de base de datos asociadas directamente.</p>
            )}
          </div>
          
          <div className="space-y-1 pt-2">
             <p className="text-xs text-muted-foreground">ID Interno: <span className="font-mono">{module.id}</span></p>
             <p className="text-xs text-muted-foreground">Última actualización: {new Date(module.updated).toLocaleString()}</p>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto" onClick={() => { onClose(); onDelete(module.id); }}>
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
          </Button>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button onClick={() => { onClose(); onEdit(module); }}>
            <Edit className="w-4 h-4 mr-2" /> Editar Módulo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleDetailsModal;