import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import ControlRecepcionForm from '@/components/control-recepcion/ControlRecepcionForm.jsx';
import { useControlRecepcion } from '@/hooks/useControlRecepcion.js';
import { ArrowLeft } from 'lucide-react';

const CreateControlRecepcionPage = () => {
  const navigate = useNavigate();
  const { createRegistro, generateNextFolio, loading } = useControlRecepcion();
  const [initialData, setInitialData] = useState(null);
  
  // State lifted to manage the two-step form flow
  const [liEstablished, setLiEstablished] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const folio = await generateNextFolio();
      if (mounted) setInitialData({ folio });
    };
    init();
    return () => { mounted = false; };
  }, [generateNextFolio]);

  const handleSubmit = async (formData, isPreview) => {
    const res = await createRegistro(formData);
    if (res.success) {
      if (isPreview) {
        navigate(`/control-recepcion/${res.data.id}/previsualizar`);
      } else {
        navigate('/control-recepcion');
      }
    }
  };

  return (
    <>
      <Helmet><title>Nuevo Registro Recepción - Gas Victoria</title></Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" onClick={() => navigate('/control-recepcion')} className="mb-6 hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>
          
          {initialData ? (
            <ControlRecepcionForm 
              initialData={initialData} 
              onSubmit={handleSubmit} 
              isLoading={loading} 
              liEstablished={liEstablished}
              setLiEstablished={setLiEstablished}
            />
          ) : (
            <div className="text-center py-24 text-muted-foreground flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              Generando folio de recepción...
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CreateControlRecepcionPage;