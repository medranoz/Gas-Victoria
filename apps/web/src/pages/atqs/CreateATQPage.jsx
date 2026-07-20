import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ATQForm from '@/components/atqs/ATQForm.jsx';

const CreateATQPage = () => {
  return (
    <>
      <Helmet>
        <title>Crear ATQ - Gas Victoria</title>
        <meta name="description" content="Registra un nuevo autotanque en el sistema." />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-muted/10">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <ATQForm />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CreateATQPage;