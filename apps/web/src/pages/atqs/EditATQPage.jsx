import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ATQForm from '@/components/atqs/ATQForm.jsx';

const EditATQPage = () => {
  const { id } = useParams();
  
  return (
    <>
      <Helmet>
        <title>Editar ATQ - Gas Victoria</title>
        <meta name="description" content="Edita los datos del autotanque seleccionado." />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-muted/10">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <ATQForm atqId={id} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default EditATQPage;