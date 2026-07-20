import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const ModuleSyncManager = ({ syncStatus, lastSync, onSync }) => {
  return (
    <div className="flex items-center gap-4 bg-card p-3 rounded-xl border border-border shadow-sm">
      <div className="flex items-center gap-2">
        {syncStatus === 'synced' && <CheckCircle2 className="w-5 h-5 text-sync-synced" />}
        {syncStatus === 'syncing' && <RefreshCw className="w-5 h-5 text-sync-syncing animate-spin" />}
        {syncStatus === 'error' && <AlertCircle className="w-5 h-5 text-sync-error" />}
        
        <span className="text-sm font-medium">
          {syncStatus === 'synced' && 'Sincronizado'}
          {syncStatus === 'syncing' && 'Sincronizando...'}
          {syncStatus === 'error' && 'Error de sincronización'}
        </span>
      </div>
      
      <div className="h-4 w-px bg-border mx-2"></div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>Última sync: {lastSync ? lastSync.toLocaleTimeString() : 'Nunca'}</span>
      </div>
      
      <Button variant="outline" size="sm" onClick={onSync} disabled={syncStatus === 'syncing'} className="ml-auto">
        <RefreshCw className={`w-4 h-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
        Forzar Sincronización
      </Button>
    </div>
  );
};

export default ModuleSyncManager;