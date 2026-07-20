import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useModulos, getModulePath } from '@/contexts/ModulosContext.jsx';
import { getIcon } from '@/lib/iconMap.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Gauge, Scissors, ShieldAlert } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const SuperadminDashboard = () => {
  const { getModulosByUbicacion, getActiveModulos } = useModulos();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ drvActivos: 0 });

  const drvEnabled = getActiveModulos().some(m => m.nombre?.toLowerCase() === 'drv');

  useEffect(() => {
    const fetchStats = async () => {
      if (drvEnabled) {
        const drvs = await pb.collection('drv').getList(1, 1, { filter: 'estado="activo"', $autoCancel: false }).catch(()=>({totalItems:0}));
        setStats({ drvActivos: drvs.totalItems });
      }
    };
    fetchStats();
  }, [drvEnabled]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Panel de superadministrador</h2>
      </div>

      {drvEnabled && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/drv')}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Gauge className="w-4 h-4"/> DRVs Activos</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-primary">{stats.drvActivos}</div></CardContent>
          </Card>
          <Card className="cursor-pointer bg-secondary/10 hover:bg-secondary/20 border-secondary/20 transition-colors" onClick={() => navigate('/drv/cortes')}>
            <CardContent className="pt-6 flex items-center justify-center gap-3 h-full">
              <Scissors className="w-6 h-6 text-secondary" />
              <div className="font-semibold text-secondary-foreground">Registrar Corte</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer bg-destructive/5 hover:bg-destructive/10 border-destructive/20 transition-colors" onClick={() => navigate('/drv/auditoria')}>
            <CardContent className="pt-6 flex items-center justify-center gap-3 h-full">
              <ShieldAlert className="w-6 h-6 text-destructive" />
              <div className="font-semibold text-destructive">Auditoría DRV</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Render generic modules */}
    </div>
  );
};

export default SuperadminDashboard;