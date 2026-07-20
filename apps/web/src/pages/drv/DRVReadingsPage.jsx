import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useDRVReadings } from '@/hooks/useDRVReadings.js';
import { useDRVs } from '@/hooks/useDRVs.js';
import DRVReadingsList from '@/components/drv/DRVReadingsList.jsx';
import { ArrowLeft, Plus, History } from 'lucide-react';

const DRVReadingsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDRVById } = useDRVs();
  const { fetchReadings, deleteReading, applyCut, loading } = useDRVReadings();
  
  const [drv, setDrv] = useState(null);
  const [readings, setReadings] = useState([]);

  const loadData = async () => {
    const drvRes = await getDRVById(id);
    if (drvRes.success) setDrv(drvRes.data);
    
    const readRes = await fetchReadings(id);
    if (readRes.success) setReadings(readRes.data);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async (readId) => {
    const res = await deleteReading(readId);
    if (res.success) loadData();
  };

  const handleApplyCut = async (readId) => {
    if (window.confirm('¿Está seguro de aplicar el corte? Esto generará un nuevo registro pendiente y actualizará el DRV.')) {
      const res = await applyCut(readId);
      if (res.success) loadData();
    }
  };

  return (
    <>
      <Helmet><title>Registros DRV - Gas Victoria</title></Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 max-w-7xl">
          <Button variant="ghost" onClick={() => navigate('/drv')} className="mb-6 hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Dispositivos
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <History className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Registros: {drv?.drv_id || 'Cargando...'}</h1>
              </div>
              <p className="text-muted-foreground text-sm">Valor Inicial Actual del Dispositivo: <span className="font-mono font-bold text-foreground">{drv?.valor_inicial_actual?.toFixed(2) || '0.00'}</span></p>
            </div>
            
            <Link to={`/drv/${id}/registros/nuevo`}>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Nuevo Registro
              </Button>
            </Link>
          </div>

          <DRVReadingsList drvId={id} readings={readings} loading={loading} onDelete={handleDelete} onApplyCut={handleApplyCut} />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default DRVReadingsPage;