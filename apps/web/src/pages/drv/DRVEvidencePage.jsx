import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import DRVEvidenceUpload from '@/components/drv/DRVEvidenceUpload.jsx';
import { useDRVEvidences } from '@/hooks/useDRVEvidences.js';
import { ArrowLeft } from 'lucide-react';

const DRVEvidencePage = () => {
  const { id, registroId } = useParams();
  const navigate = useNavigate();
  const { fetchEvidences, uploadEvidence, deleteEvidence, loading } = useDRVEvidences();
  const [evidences, setEvidences] = useState([]);

  const loadData = async () => {
    const res = await fetchEvidences(registroId);
    if (res.success) setEvidences(res.data);
  };

  useEffect(() => {
    loadData();
  }, [registroId]);

  const handleUpload = async (rId, file, comments) => {
    const res = await uploadEvidence(rId, file, comments);
    if (res.success) loadData();
    return res;
  };

  const handleDelete = async (eviId) => {
    if (window.confirm('¿Eliminar esta evidencia?')) {
      const res = await deleteEvidence(eviId);
      if (res.success) loadData();
    }
  };

  return (
    <>
      <Helmet><title>Evidencias DRV - Gas Victoria</title></Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" onClick={() => navigate(`/drv/${id}/registros`)} className="mb-6 hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Registros
          </Button>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Evidencias del Registro</h1>
            <p className="text-muted-foreground">Sube y gestiona imágenes que respalden la lectura del DRV.</p>
          </div>
          <DRVEvidenceUpload 
            registroId={registroId} 
            evidences={evidences} 
            loading={loading} 
            onUpload={handleUpload} 
            onDelete={handleDelete} 
          />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default DRVEvidencePage;