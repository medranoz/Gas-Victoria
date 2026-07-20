import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ControlRecepcionPreview from '@/components/control-recepcion/ControlRecepcionPreview.jsx';
import { useControlRecepcion } from '@/hooks/useControlRecepcion.js';

const ControlRecepcionPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRegistroById, updateRegistro, loading } = useControlRecepcion();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await getRegistroById(id);
      if (res.success) setRecord(res.data);
    };
    load();
  }, [id, getRegistroById]);

  const handleConfirm = async () => {
    const formData = new FormData();
    const res = await updateRegistro(id, formData, true); // true = isConfirming
    if (res.success) {
      const updated = await getRegistroById(id);
      if (updated.success) setRecord(updated.data);
    }
  };

  const handleBack = () => {
    if (record?.estado_registro !== 'Confirmado') {
      navigate(`/control-recepcion/${id}/editar`);
    } else {
      navigate('/control-recepcion');
    }
  };

  return (
    <>
      <Helmet><title>Detalle Recepción - Gas Victoria</title></Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {record ? (
            <ControlRecepcionPreview 
              record={record} 
              onConfirm={handleConfirm} 
              onBack={handleBack} 
              isLoading={loading} 
            />
          ) : (
            <div className="text-center py-24 text-muted-foreground">Cargando información...</div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ControlRecepcionPreviewPage;