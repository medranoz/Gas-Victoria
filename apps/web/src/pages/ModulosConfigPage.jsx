import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useModulosConfig } from '@/hooks/useModulosConfig.js';
import { useModulos } from '@/contexts/ModulosContext.jsx';
import ModuleSyncManager from '@/components/configuracion/ModuleSyncManager.jsx';
import ModuleTable from '@/components/configuracion/ModuleTable.jsx';
import ModuleForm from '@/components/configuracion/ModuleForm.jsx';
import ModuleDetailsModal from '@/components/configuracion/ModuleDetailsModal.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Plus, Search, Filter, ActivitySquare, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const ModulosConfigPage = () => {
  const navigate = useNavigate();
  const { 
    modules, loading, syncStatus, lastSync, syncNow, 
    createModule, updateModule, deleteModule, 
    validateModule, getModuleIntegrity, repairModule 
  } = useModulosConfig();
  
  const { refreshModulos } = useModulos(); 
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [detailsState, setDetailsState] = useState({ isOpen: false, module: null, integrity: null });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [filterUbicacion, setFilterUbicacion] = useState('all');

  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      const matchSearch = m.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado = filterEstado === 'all' ? true : filterEstado === 'active' ? m.estado : !m.estado;
      const matchUbicacion = filterUbicacion === 'all' ? true : m.ubicacion === filterUbicacion;
      return matchSearch && matchEstado && matchUbicacion;
    });
  }, [modules, searchTerm, filterEstado, filterUbicacion]);

  const hasIssues = useMemo(() => {
    return modules.some(m => getModuleIntegrity(m).status !== 'valid');
  }, [modules, getModuleIntegrity]);

  const handleOpenCreate = () => {
    setEditingModule(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (mod) => {
    setEditingModule(mod);
    setIsFormOpen(true);
  };

  const handleViewDetails = (module, integrity) => {
    setDetailsState({ isOpen: true, module, integrity });
  };

  const handleRepair = async (module) => {
    const success = await repairModule(module);
    if (success) {
      if (detailsState.isOpen && detailsState.module?.id === module.id) {
        setDetailsState(prev => ({ ...prev, isOpen: false }));
      }
      syncNow();
      refreshModulos(true);
    }
  };

  const notifyGlobalSync = () => {
    setTimeout(async () => {
      try {
        await refreshModulos(true);
      } catch (err) {
        // handled in context
      }
    }, 500);
  };

  const handleSubmit = async (data) => {
    let res;
    if (editingModule) {
      res = await updateModule(editingModule.id, data);
    } else {
      res = await createModule(data);
    }
    
    if (res.success) {
      setIsFormOpen(false);
      notifyGlobalSync();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('⚠️ ¿Estás seguro de eliminar este módulo? Esto ocultará las funcionalidades asociadas a todos los usuarios.')) {
      const res = await deleteModule(id);
      if (res.success) {
        notifyGlobalSync();
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] dark">
      <Helmet>
        <title>Configuración de Módulos - Gas Victoria</title>
      </Helmet>

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {hasIssues && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-yellow-600">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Se han detectado problemas de integridad en uno o más módulos. Se recomienda revisarlos o usar la función de reparación automática.</p>
            </div>
            <Button variant="outline" size="sm" className="bg-background flex-shrink-0" onClick={() => navigate('/diagnostico-modulos')}>
              Ver Diagnóstico
            </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Gestión de Módulos</h1>
            <p className="text-muted-foreground mt-1.5 max-w-2xl">Administra la estructura de la aplicación, visibilidad y accesos. Los cambios impactan el enrutamiento en tiempo real.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ModuleSyncManager syncStatus={syncStatus} lastSync={lastSync} onSync={syncNow} />
            
            <Button variant="secondary" onClick={() => navigate('/diagnostico-modulos')} className="font-medium">
              <ActivitySquare className="w-4 h-4 mr-2" /> Diagnóstico Avanzado
            </Button>
            
            <Button onClick={handleOpenCreate} className="font-semibold shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Módulo
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre..." 
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="w-40">
                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger className="bg-background">
                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48 hidden sm:block">
                <Select value={filterUbicacion} onValueChange={setFilterUbicacion}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ubicaciones</SelectItem>
                    <SelectItem value="Header Principal">Header Principal</SelectItem>
                    <SelectItem value="Sección Dashboard">Sección Dashboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" onClick={syncNow} disabled={syncStatus === 'syncing'} title="Refrescar lista">
                <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {loading && modules.length === 0 ? (
          <div className="space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-16 bg-muted/20 animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <ModuleTable 
            modules={filteredModules} 
            onEdit={handleOpenEdit} 
            onViewDetails={handleViewDetails}
            onRepair={handleRepair}
            getIntegrity={getModuleIntegrity}
          />
        )}

      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingModule ? 'Editar Configuración de Módulo' : 'Registrar Nuevo Módulo'}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <ModuleForm 
              initialData={editingModule} 
              onSubmit={handleSubmit} 
              onCancel={() => setIsFormOpen(false)}
              isLoading={syncStatus === 'syncing'}
              validateModule={validateModule}
            />
          </div>
        </DialogContent>
      </Dialog>

      <ModuleDetailsModal
        isOpen={detailsState.isOpen}
        module={detailsState.module}
        integrity={detailsState.integrity}
        onClose={() => setDetailsState({ isOpen: false, module: null, integrity: null })}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onRepair={handleRepair}
      />

      <Footer />
    </div>
  );
};

export default ModulosConfigPage;