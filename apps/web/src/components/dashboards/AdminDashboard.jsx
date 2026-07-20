import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useModulos } from '@/contexts/ModulosContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Gauge, Scissors, History, DatabaseZap } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { getUserDisplayName } from '@/lib/utils.js';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { getActiveModulos } = useModulos();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ drvActivos: 0, cortesRecientes: 0, tanquesActivos: 0 });

  const activeNames = getActiveModulos().map(m => m.nombre?.toLowerCase() || '');
  const drvEnabled = activeNames.includes('drv');
  const cargaEnabled = activeNames.includes('control de carga') || activeNames.includes('carga');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let newStats = { drvActivos: 0, cortesRecientes: 0, tanquesActivos: 0 };
        
        if (drvEnabled) {
          const drvs = await pb.collection('drv').getList(1, 1, { filter: 'estado="activo"', $autoCancel: false }).catch(()=>({totalItems:0}));
          const date = new Date();
          date.setDate(date.getDate() - 7);
          const cortes = await pb.collection('drv_cortes').getList(1, 1, { filter: `fecha_hora_vf >= "${date.toISOString()}"`, $autoCancel: false }).catch(()=>({totalItems:0}));
          newStats.drvActivos = drvs.totalItems;
          newStats.cortesRecientes = cortes.totalItems;
        }

        if (cargaEnabled) {
          const tanques = await pb.collection('tanques_carga').getList(1, 1, { filter: 'estado="Activo"', $autoCancel: false }).catch(()=>({totalItems:0}));
          newStats.tanquesActivos = tanques.totalItems;
        }

        setStats(newStats);
      } catch (error) { 
        console.error("Error fetching admin stats:", error); 
      }
    };
    fetchStats();
  }, [drvEnabled, cargaEnabled]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground uppercase">
          BIENVENIDO, {getUserDisplayName(currentUser)}
        </h2>
        <p className="text-muted-foreground mt-2">Panel de administrador - Supervisión operativa y logística de distribución</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {drvEnabled && (
          <>
            <Card className="bg-primary/5 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer shadow-sm" onClick={() => navigate('/drv')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-primary"/> DRVs Activos
                </CardTitle>
              </CardHeader>
              <CardContent><div className="text-3xl font-bold text-primary">{stats.drvActivos}</div></CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-border/80 transition-colors shadow-sm" onClick={() => navigate('/drv/historial')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <History className="w-4 h-4"/> Cortes DRV (Últimos 7 días)
                </CardTitle>
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-foreground">{stats.cortesRecientes}</div></CardContent>
            </Card>
            <Card className="cursor-pointer bg-secondary/10 hover:bg-secondary/20 border-secondary/20 transition-colors shadow-sm" onClick={() => navigate('/drv/cortes')}>
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-full">
                <Scissors className="w-8 h-8 text-secondary mb-2" />
                <div className="font-semibold text-secondary-foreground">Registrar Nuevo Corte DRV</div>
              </CardContent>
            </Card>
          </>
        )}

        {cargaEnabled && (
          <Card className="bg-accent/5 border-accent/20 hover:border-accent/50 transition-colors cursor-pointer shadow-sm" onClick={() => navigate('/carga')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DatabaseZap className="w-4 h-4 text-accent-foreground"/> Tanques Activos
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-accent-foreground">{stats.tanquesActivos}</div></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;