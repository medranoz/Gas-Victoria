import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import ProveedoresForm from '@/components/proveedores/ProveedoresForm.jsx';
import { useProveedores } from '@/hooks/useProveedores.js';
import { ArrowLeft, Building, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton.jsx';

const EditProveedorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProveedorById, updateProveedor, loading } = useProveedores();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await getProveedorById(id);
      if (mounted) {
        if (res.success) {
            setData(res.data);
        } else {
            setError(true);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, getProveedorById]);

  const handleSubmit = async (formData) => {
    try {
        const res = await updateProveedor(id, formData);
        if (res.success) {
            navigate('/proveedores');
        }
    } catch (err) {
        console.error(err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Proveedor no encontrado</h2>
          <p className="text-muted-foreground mb-8">El proveedor que intentas editar no existe o fue eliminado.</p>
          <Button asChild><Link to="/proveedores">Volver al Catálogo</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>Editar Proveedor - Gas Victoria</title></Helmet>
      <Header />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Button variant="ghost" asChild className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <Link to="/proveedores"><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Proveedores</Link>
        </Button>
        
        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 border border-blue-500/20">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Editar Proveedor</h1>
            <p className="text-muted-foreground mt-1">Modifica los detalles operativos y de contacto del proveedor.</p>
          </div>
        </div>

        {data ? (
          <ProveedoresForm initialData={data} onSubmit={handleSubmit} isLoading={loading} />
        ) : (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default EditProveedorPage;