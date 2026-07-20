import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import ProveedoresForm from '@/components/proveedores/ProveedoresForm.jsx';
import { useProveedores } from '@/hooks/useProveedores.js';
import { ArrowLeft, Building } from 'lucide-react';
import { toast } from 'sonner';

const CreateProveedorPage = () => {
  const navigate = useNavigate();
  const { createProveedor, generateNextCodigo, loading } = useProveedores();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const code = await generateNextCodigo();
        if (mounted) setInitialData({ codigo_proveedor: code });
      } catch (error) {
        toast.error('Error al generar código de proveedor');
        if (mounted) setInitialData({ codigo_proveedor: '' });
      }
    };
    init();
    return () => { mounted = false; };
  }, [generateNextCodigo]);

  const handleSubmit = async (data) => {
    try {
      const res = await createProveedor(data);
      if (res.success) {
        navigate('/proveedores');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Nuevo Proveedor - Gas Victoria</title></Helmet>
      <Header />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Button variant="ghost" asChild className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <Link to="/proveedores"><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Proveedores</Link>
        </Button>
        
        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Nuevo Proveedor</h1>
            <p className="text-muted-foreground mt-1">Registra un nuevo proveedor en el sistema.</p>
          </div>
        </div>

        {initialData ? (
          <ProveedoresForm initialData={initialData} onSubmit={handleSubmit} isLoading={loading} />
        ) : (
          <div className="text-center py-24 text-muted-foreground">Generando código de proveedor...</div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateProveedorPage;