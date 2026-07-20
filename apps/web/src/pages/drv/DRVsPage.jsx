import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useDRVs } from '@/hooks/useDRVs.js';
import DRVsList from '@/components/drv/DRVsList.jsx';
import { Gauge, Plus, FileText } from 'lucide-react';

const DRVsPage = () => {
  const { fetchDRVs, deleteDRV, loading } = useDRVs();
  const [drvs, setDrvs] = useState([]);

  const loadData = async () => {
    const res = await fetchDRVs();
    if (res.success) setDrvs(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    const res = await deleteDRV(id);
    if (res.success) loadData();
  };

  return (
    <>
      <Helmet>
        <title>Gestión de DRV - Gas Victoria</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Gauge className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Dispositivos DRV</h1>
              </div>
              <p className="text-muted-foreground">Administre los dispositivos DRV y sus registros de cortes.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/drv/reportes">
                <Button variant="outline" className="hover:bg-accent transition-colors">
                  <FileText className="w-4 h-4 mr-2" /> Reportes
                </Button>
              </Link>
              <Link to="/drv/crear">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]">
                  <Plus className="w-4 h-4 mr-2" /> Nuevo DRV
                </Button>
              </Link>
            </div>
          </div>

          <DRVsList drvs={drvs} loading={loading} onDelete={handleDelete} />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default DRVsPage;