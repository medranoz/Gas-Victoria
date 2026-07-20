import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useControlRecepcion } from '@/hooks/useControlRecepcion.js';
import ControlRecepcionList from '@/components/control-recepcion/ControlRecepcionList.jsx';
import { ClipboardList, Plus, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const ControlRecepcionPage = () => {
  const { fetchRegistros, deleteRegistro, loading, error } = useControlRecepcion();
  const [registros, setRegistros] = useState([]);

  const loadData = async () => {
    console.log('[ControlRecepcionPage] Loading data...');
    const res = await fetchRegistros();
    if (res.success) {
      setRegistros(res.data || []);
    } else if (!res.aborted) {
      console.error('[ControlRecepcionPage] Error loading data:', res.error);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este registro?')) return;
    const res = await deleteRegistro(id);
    if (res.success) {
      loadData();
    }
  };

  return (
    <>
      <Helmet>
        <title>Control Recepción - Gas Victoria</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Control de Recepción</h1>
              </div>
              <p className="text-muted-foreground">Gestione el registro de recepción de surtido de proveedores.</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="shadow-sm" onClick={loadData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualizar
              </Button>
              <Link to="/control-recepcion/reportes">
                <Button variant="outline" className="shadow-sm">
                  <FileText className="w-4 h-4 mr-2" /> Reportes
                </Button>
              </Link>
              <Link to="/control-recepcion/crear">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                  <Plus className="w-4 h-4 mr-2" /> Nuevo Registro
                </Button>
              </Link>
            </div>
          </div>

          {error && !loading ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6 flex flex-col items-center justify-center text-center py-12">
              <p className="font-semibold mb-2">Error al cargar registros</p>
              <p className="text-sm opacity-90 mb-4">{error.message || 'Verifica tu conexión y vuelve a intentar.'}</p>
              <Button variant="outline" onClick={loadData}>Reintentar</Button>
            </div>
          ) : (
            <ControlRecepcionList registros={registros} loading={loading} onDelete={handleDelete} />
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ControlRecepcionPage;