import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useProveedores } from '@/hooks/useProveedores.js';
import ProveedoresList from '@/components/proveedores/ProveedoresList.jsx';
import { Building2, Plus } from 'lucide-react';

const ProveedoresPage = () => {
  const { fetchProveedores, deleteProveedor, loading } = useProveedores();
  const [proveedores, setProveedores] = useState([]);

  const loadData = async () => {
    const res = await fetchProveedores();
    if (res.success) setProveedores(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    const res = await deleteProveedor(id);
    if (res.success) loadData();
  };

  return (
    <>
      <Helmet><title>Proveedores - Gas Victoria</title></Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Proveedores</h1>
              </div>
              <p className="text-muted-foreground">Catálogo de proveedores autorizados para descarga.</p>
            </div>
            
            <Link to="/proveedores/crear">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Nuevo Proveedor
              </Button>
            </Link>
          </div>

          <ProveedoresList proveedores={proveedores} loading={loading} onDelete={handleDelete} />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProveedoresPage;