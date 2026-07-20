import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import DRVForm from '@/components/drv/DRVForm.jsx';
import { useDRVs } from '@/hooks/useDRVs.js';
import { ArrowLeft } from 'lucide-react';

const EditDRVPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDRVById, updateDRV, loading } = useDRVs();
  const [drv, setDrv] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const res = await getDRVById(id);
      if (res.success) setDrv(res.data);
    };
    loadData();
  }, [id, getDRVById]);

  const handleSubmit = async (data) => {
    const res = await updateDRV(id, data);
    if (res.success) navigate('/drv');
  };

  return (
    <>
      <Helmet><title>Editar DRV - Gas Victoria</title></Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate('/drv')} className="mb-6 hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>
          {drv && <DRVForm initialData={drv} onSubmit={handleSubmit} isLoading={loading} />}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default EditDRVPage;