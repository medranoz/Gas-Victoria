import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import ControlRecepcionForm from '@/components/control-recepcion/ControlRecepcionForm.jsx';
import { useControlRecepcion } from '@/hooks/useControlRecepcion.js';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const EditControlRecepcionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRegistroById, updateRegistro, loading } = useControlRecepcion();
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await getRegistroById(id);
      if (res.success) {
        if (res.data.estado_registro === 'Confirmado') {
          toast.error('Un registro confirmado no se puede editar');
          navigate('/control-recepcion');
          return;
        }
        setData(res.data);
      } else {
        navigate('/control-recepcion');
      }
    };
    load();
  }, [id, getRegistroById, navigate]);

  const handleSubmit = async (formData, isPreview) => {
    const res = await updateRegistro(id, formData, false);
    if (res.success) {
      if (isPreview) {
        navigate(`/control-recepcion/${id}/previsualizar`);
      } else {
        navigate('/control-recepcion');
      }
    }
  };

  return (
    <>
      <Helmet><title>Editar Recepción - Gas Victoria</title></Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" onClick={() => navigate('/control-recepcion')} className="mb-6 hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>
          
          {data ? (
            <ControlRecepcionForm initialData={data} onSubmit={handleSubmit} isLoading={loading} />
          ) : (
            <div className="text-center py-24 text-muted-foreground">Cargando...</div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default EditControlRecepcionPage;