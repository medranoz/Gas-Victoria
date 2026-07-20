import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import DRVSelector from '@/components/drv/DRVSelector.jsx';
import CutForm from '@/components/drv/CutForm.jsx';
import CutPreview from '@/components/drv/CutPreview.jsx';
import { useCalculateCut } from '@/hooks/useCalculateCut.js';
import { useDRVs } from '@/hooks/useDRVs.js';
import { ArrowLeft, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const ManageCutsPage = () => {
  const navigate = useNavigate();
  const { fetchDRVs } = useDRVs();
  const { saveCut, isLoading } = useCalculateCut();
  
  const [drvList, setDrvList] = useState([]);
  const [selectedDrvId, setSelectedDrvId] = useState('');
  const [previewData, setPreviewData] = useState(null);
  
  const selectedDRV = drvList.find(d => d.id === selectedDrvId) || null;

  useEffect(() => {
    const loadData = async () => {
      const res = await fetchDRVs('estado="activo"');
      if (res.success) setDrvList(res.data);
    };
    loadData();
  }, [fetchDRVs]);

  const handleConfirmCut = async () => {
    if (!previewData) return;
    const result = await saveCut(
      previewData.drvid_real, 
      previewData.vi, 
      previewData.vf, 
      previewData.usuario_id,
      previewData.observaciones
    );
    if (result.success) {
      setPreviewData(null);
      setSelectedDrvId('');
      // Refresh list
      const res = await fetchDRVs('estado="activo"');
      if (res.success) setDrvList(res.data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Registrar Corte - Gas Victoria</title></Helmet>
      <Header />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-10 flex flex-col items-start">
          <Button variant="ghost" onClick={() => navigate('/drv')} className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a DRVs
          </Button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary border border-secondary/20">
              <Scissors className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Registro de Corte</h1>
              <p className="text-muted-foreground text-sm mt-1">Calcula y registra los cortes volumétricos.</p>
            </div>
          </div>
        </div>

        {!previewData ? (
          <div className="grid gap-8">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <DRVSelector drvList={drvList} selectedId={selectedDrvId} onSelect={setSelectedDrvId} disabled={isLoading} />
            </div>
            <CutForm selectedDRV={selectedDRV} onPreview={setPreviewData} />
          </div>
        ) : (
          <CutPreview 
            previewData={previewData} 
            onConfirm={handleConfirmCut} 
            onCancel={() => setPreviewData(null)} 
            isLoading={isLoading} 
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ManageCutsPage;