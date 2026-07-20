import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EstacionForm from '@/components/estaciones/EstacionForm.jsx';
import { useEstaciones } from '@/hooks/useEstaciones.js';
import { ChevronRight, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton.jsx';

const EditEstacionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEstacionById, updateEstacion, isLoading } = useEstaciones();
  const [estacion, setEstacion] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await getEstacionById(id);
      if (data) {
        setEstacion(data);
      } else {
        navigate('/estaciones');
      }
    };
    loadData();
  }, [id, getEstacionById, navigate]);

  const handleSubmit = async (data) => {
    const res = await updateEstacion(id, data);
    if (res.success) {
      navigate(`/estaciones/detalle/${id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet>
        <title>Editar Estación - Gas Victoria</title>
      </Helmet>

      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link to="/estaciones" className="hover:text-foreground transition-colors">Estaciones</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to={`/estaciones/detalle/${id}`} className="hover:text-foreground transition-colors">{estacion?.nombre || 'Detalle'}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground font-medium">Editar</span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-secondary/10 rounded-xl text-secondary-foreground">
            <Edit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Editar Estación</h1>
            <p className="text-muted-foreground text-sm mt-1">Modifica los datos de la estación.</p>
          </div>
        </div>

        {!estacion ? (
          <div className="bg-card p-8 rounded-2xl border border-border space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <EstacionForm 
            initialData={estacion}
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
            isEditMode={true} 
          />
        )}

      </main>

      <Footer />
    </div>
  );
};

export default EditEstacionPage;