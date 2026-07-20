import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import DRVReadingsForm from '@/components/drv/DRVReadingsForm.jsx';
import { useDRVReadings } from '@/hooks/useDRVReadings.js';
import { useDRVs } from '@/hooks/useDRVs.js';
import { ArrowLeft } from 'lucide-react';

const CreateDRVReadingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDRVById } = useDRVs();
  const { createReading, loading } = useDRVReadings();
  const [initialValue, setInitialValue] = useState(0);

  useEffect(() => {
    const init = async () => {
      const res = await getDRVById(id);
      if (res.success) setInitialValue(res.data.valor_inicial_actual);
    };
    init();
  }, [id, getDRVById]);

  const handleSubmit = async (data) => {
    const res = await createReading(data);
    if (res.success) navigate(`/drv/${id}/registros`);
  };

  return (
    <>
      <Helmet><title>Nuevo Registro DRV - Gas Victoria</title></Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(`/drv/${id}/registros`)} className="mb-6 hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Registros
          </Button>
          <DRVReadingsForm drvId={id} initialValue={initialValue} onSubmit={handleSubmit} isLoading={loading} />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CreateDRVReadingPage;