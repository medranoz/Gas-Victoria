import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import DRVForm from '@/components/drv/DRVForm.jsx';
import { useDRVs } from '@/hooks/useDRVs.js';
import { ArrowLeft, Gauge } from 'lucide-react';

const CreateDRVPage = () => {
  const navigate = useNavigate();
  const { createDRV, generateNextDrvId, loading } = useDRVs();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const nextId = await generateNextDrvId();
      if (mounted) {
        setInitialData({ drv_id: nextId });
      }
    };
    init();
    return () => { mounted = false; };
  }, [generateNextDrvId]);

  const handleSubmit = async (data) => {
    // Explicitly call createDRV from useDRVs which targets 'drv' collection
    const res = await createDRV(data);
    if (res.success) {
      navigate('/drv');
    }
  };

  return (
    <>
      <Helmet>
        <title>Nuevo DRV - Gas Victoria</title>
        <meta name="description" content="Registrar nuevo dispositivo DRV" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/drv')} 
                className="mb-4 hover:bg-muted transition-colors -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> 
                Volver al listado
              </Button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Gauge className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Registrar Dispositivo DRV
                </h1>
              </div>
              <p className="text-muted-foreground">
                Complete el formulario para agregar un nuevo dispositivo al sistema.
              </p>
            </div>

            {initialData ? (
              <DRVForm 
                initialData={initialData} 
                onSubmit={handleSubmit} 
                isLoading={loading} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-muted/10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground font-medium">Generando identificador único...</p>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default CreateDRVPage;