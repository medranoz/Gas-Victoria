import React, { useEffect, useState } from 'react';
import { useModulos } from '@/contexts/ModulosContext.jsx';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';

const ModulosSyncIndicator = () => {
  const { syncStatus, lastSync, error, refreshModulos } = useModulos();
  const [visible, setVisible] = useState(true);

  // Auto-hide indicator after 3 seconds on success
  useEffect(() => {
    let timeout;
    if (syncStatus === 'synced') {
      timeout = setTimeout(() => {
        setVisible(false);
      }, 3000);
    } else {
      setVisible(true);
    }
    return () => clearTimeout(timeout);
  }, [syncStatus]);

  if (!visible && syncStatus === 'synced') return null;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={() => { setVisible(true); refreshModulos(); }}
            className={`flex items-center justify-center p-1.5 rounded-full transition-all duration-300 border shadow-sm
              ${syncStatus === 'syncing' ? 'bg-yellow-500/10 border-yellow-500/20' : ''}
              ${syncStatus === 'synced' ? 'bg-green-500/10 border-green-500/20' : ''}
              ${syncStatus === 'error' ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20' : ''}
            `}
          >
            {syncStatus === 'syncing' && <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />}
            {syncStatus === 'synced' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
            {syncStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="text-xs">
          <p className="font-medium">
            {syncStatus === 'syncing' && 'Sincronizando módulos...'}
            {syncStatus === 'synced' && `Módulos sincronizados (${lastSync?.toLocaleTimeString()})`}
            {syncStatus === 'error' && `Error de sincronización`}
          </p>
          {error && <p className="text-muted-foreground mt-0.5">{error}</p>}
          {syncStatus === 'error' && <p className="text-muted-foreground mt-0.5">Haz clic para reintentar</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ModulosSyncIndicator;