import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { ArrowLeft, Edit, Fuel, Calendar, Hash, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const DRVDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drv, setDrv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDRV = async () => {
      try {
        const record = await pb.collection('drv').getOne(id, { $autoCancel: false });
        setDrv(record);
      } catch (error) {
        console.error("Error fetching DRV details:", error);
        toast.error('No se pudo encontrar el dispositivo DRV especificado.');
        navigate('/descarga');
      } finally {
        setLoading(false);
      }
    };
    fetchDRV();
  }, [id, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet>
        <title>Detalles del DRV - Gas Victoria</title>
      </Helmet>

      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col items-start">
            <Button variant="ghost" onClick={() => navigate('/descarga')} className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Dispositivos
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Fuel className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Detalles del Dispositivo</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate(`/descarga/editar/${id}`)} disabled={loading}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Equipo
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[150px] w-full rounded-2xl" />
              <Skeleton className="h-[150px] w-full rounded-2xl" />
            </div>
          </div>
        ) : drv ? (
          <div className="space-y-6">
            <Card className="shadow-md border-border rounded-2xl overflow-hidden">
              <CardHeader className="bg-card border-b border-border/50 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold text-foreground mb-1">{drv.marca}</CardTitle>
                    <p className="text-muted-foreground font-medium text-lg">{drv.modelo}</p>
                  </div>
                  <Badge variant="outline" className={`px-3 py-1 text-sm font-semibold uppercase tracking-wider ${drv.estado === 'activo' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                    {drv.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-card">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4" /> Identificador Interno
                    </h3>
                    <p className="text-base font-mono bg-muted/50 p-3 rounded-lg border border-border/50">{drv.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4" /> Valor Inicial Actual (VI)
                    </h3>
                    <p className="text-3xl font-black font-mono text-primary">
                      {drv.vi_actual?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} <span className="text-lg text-muted-foreground font-medium">L</span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" /> Fecha de Calibración
                    </h3>
                    <p className="text-base font-medium p-3 rounded-lg bg-muted/50 border border-border/50">
                      {formatDate(drv.fecha_calibracion)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" /> Fecha de Registro VI
                    </h3>
                    <p className="text-base font-medium p-3 rounded-lg bg-muted/50 border border-border/50">
                      {formatDate(drv.fecha_vi)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 flex justify-between items-center shadow-sm">
                <span className="text-sm font-medium text-muted-foreground">Fecha de Creación</span>
                <span className="text-sm font-mono">{formatDate(drv.created)}</span>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex justify-between items-center shadow-sm">
                <span className="text-sm font-medium text-muted-foreground">Última Actualización</span>
                <span className="text-sm font-mono">{formatDate(drv.updated)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default DRVDetailPage;