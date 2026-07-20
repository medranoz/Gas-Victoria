import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EstacionForm from '@/components/estaciones/EstacionForm.jsx';
import { useEstaciones } from '@/hooks/useEstaciones.js';
import { ChevronRight, Building2 } from 'lucide-react';

const CreateEstacionPage = () => {
  const navigate = useNavigate();
  const { createEstacion, isLoading } = useEstaciones();

  const handleSubmit = async (data) => {
    const res = await createEstacion(data);
    if (res.success && res.data) {
      navigate(`/estaciones/detalle/${res.data.id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet>
        <title>Nueva Estación - Gas Victoria</title>
      </Helmet>

      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link to="/estaciones" className="hover:text-foreground transition-colors">Estaciones</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground font-medium">Nueva Estación</span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Registrar Nueva Estación</h1>
            <p className="text-muted-foreground text-sm mt-1">Ingresa los datos de la nueva planta o estación de carburación.</p>
          </div>
        </div>

        <EstacionForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
          isEditMode={false} 
        />

      </main>

      <Footer />
    </div>
  );
};

export default CreateEstacionPage;