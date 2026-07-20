import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Plus, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProviderTable from '@/components/proveedores/ProviderTable.jsx';
import SearchBar from '@/components/proveedores/SearchBar.jsx';

const ProveedoresPage = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('proveedores').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setProviders(records);
      setFilteredProviders(records);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Error al cargar los proveedores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProviders(providers);
    } else {
      const filtered = providers.filter(provider =>
        provider.razon_social.toLowerCase().includes(searchQuery.toLowerCase()) || 
        provider.codigo_proveedor?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProviders(filtered);
    }
  }, [searchQuery, providers]);

  const handleCreateNew = () => {
    navigate('/proveedores/nuevo');
  };

  const handleEditProvider = (provider) => {
    navigate(`/proveedores/editar/${provider.id}`);
  };

  const handleViewProvider = (provider) => {
    navigate(`/proveedores/detalle/${provider.id}`);
  };

  const handleDelete = () => {
    fetchProviders();
  };

  const handleExportCSV = () => {
    if (providers.length === 0) {
      toast.error('No hay proveedores para exportar');
      return;
    }

    try {
      const csvData = providers.map(provider => ({
        'ID': provider.id,
        'Código': provider.codigo_proveedor,
        'Estado': provider.estado,
        'Razón Social': provider.razon_social,
        'Dirección': provider.direccion || '',
        'Teléfono': provider.telefono || '',
        'Email': provider.email || '',
        'Observaciones': provider.observaciones || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(csvData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Proveedores');

      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `proveedores_${timestamp}.csv`);

      toast.success('Archivo CSV exportado correctamente');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Error al exportar el archivo CSV');
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          if (jsonData.length === 0) {
            toast.error('El archivo CSV está vacío');
            setIsImporting(false);
            return;
          }

          let successCount = 0;
          let errorCount = 0;

          // Quick logic to get last provider code context to increment properly
          const allProvs = await pb.collection('proveedores').getFullList({ sort: '-created', $autoCancel: false });
          let nextNumber = 1;
          if(allProvs.length > 0) {
              const numbers = allProvs.map(p => {
                  const match = p.codigo_proveedor?.match(/PROV-(\d+)/) || p.codigo_proveedor?.match(/PRV-(\d+)/);
                  return match ? parseInt(match[1], 10) : 0;
              }).filter(n => !isNaN(n));
              nextNumber = Math.max(...numbers, 0) + 1;
          }

          for (const row of jsonData) {
            const razonSocial = row['Razón Social'] || row['razon_social'] || row['Razon Social'];
            
            if (!razonSocial || razonSocial.trim() === '') {
              errorCount++;
              continue;
            }

            try {
              const generatedCode = `PROV-${String(nextNumber).padStart(4, '0')}`;
              
              await pb.collection('proveedores').create({
                codigo_proveedor: generatedCode,
                razon_social: razonSocial.trim(),
                estado: row['Estado'] || row['estado'] || 'Activo',
                direccion: (row['Dirección'] || row['direccion'] || '').toString().trim(),
                telefono: (row['Teléfono'] || row['telefono'] || '').toString().trim(),
                email: (row['Email'] || row['email'] || '').toString().trim(),
                observaciones: (row['Observaciones'] || row['observaciones'] || '').toString().trim()
              }, { $autoCancel: false });
              
              nextNumber++;
              successCount++;
            } catch (error) {
              console.error('Error creating provider from CSV:', error);
              errorCount++;
            }
          }

          if (successCount > 0) {
            toast.success(`${successCount} proveedor(es) importado(s) correctamente`);
            fetchProviders();
          }

          if (errorCount > 0) {
            toast.error(`${errorCount} proveedor(es) no pudieron ser importados`);
          }
        } catch (error) {
          console.error('Error parsing CSV:', error);
          toast.error('Error al procesar el archivo CSV. Verifica el formato.');
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Error al leer el archivo');
      setIsImporting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Catálogo de proveedores - Gas Victoria</title>
        <meta name="description" content="Gestiona el catálogo completo de proveedores de Gas Victoria" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />

        <main className="flex-1 py-8 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Catálogo de Proveedores</h1>
              <p className="text-muted-foreground">
                Gestiona la información comercial y de contacto de tus proveedores.
              </p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="w-full sm:w-96">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Buscar por nombre o código..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="gap-2 bg-background shadow-sm"
                  disabled={providers.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="gap-2 bg-background shadow-sm"
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4" />
                  {isImporting ? 'Importando...' : 'Importar CSV'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImportCSV}
                  className="hidden"
                />

                <Button
                  onClick={handleCreateNew}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo proveedor
                </Button>
              </div>
            </div>

            <ProviderTable
              providers={filteredProviders}
              onEdit={handleEditProvider}
              onView={handleViewProvider}
              onDelete={handleDelete}
              isLoading={isLoading}
            />

            {!isLoading && filteredProviders.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground text-center tabular-nums">
                Mostrando {filteredProviders.length} de {providers.length} proveedor(es)
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProveedoresPage;