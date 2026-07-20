import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import DRVReadingsForm from '@/components/drv/DRVReadingsForm.jsx';
import { useDRVReadings } from '@/hooks/useDRVReadings.js';
import { ArrowLeft } from 'lucide-react';

const EditDRVReadingPage = () => {
  const { id, registroId } = useParams();
  const navigate = useNavigate();
  const { getReadingById, updateReading, loading } = useDRVReadings();
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await getReadingById(registroId);
      if (res.success) setData(res.data);
    };
    load();
  }, [registroId, getReadingById]);

  const handleSubmit = async (formData) => {
    const res = await updateReading(registroId, formData);
    if (res.success) navigate(`/drv/${id}/registros`);
  };

  return (
    <>
      <Helmet><title>Editar Registro DRV - Gas Victoria</title></Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(`/drv/${id}/registros`)} className="mb-6 hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Registros
          </Button>
          {data && <DRVReadingsForm initialData={data} drvId={id} onSubmit={handleSubmit} isLoading={loading} />}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default EditDRVReadingPage;