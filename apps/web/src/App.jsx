import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { ModulosProvider } from '@/contexts/ModulosContext.jsx';
import { Toaster } from '@/components/ui/sonner.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';

// Core Pages
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';

// Configuration & System Pages
import ConfiguracionPage from '@/pages/ConfiguracionPage.jsx';
import ModulosConfigPage from '@/pages/ModulosConfigPage.jsx';
import ModuleDiagnosticPage from '@/pages/ModuleDiagnosticPage.jsx';
import LogotiposPage from '@/pages/LogotiposPage.jsx';
import UsuariosPage from '@/pages/UsuariosPage.jsx';
import NotificacionesPage from '@/pages/NotificacionesPage.jsx';

// DRV specific imports
import DRVsPage from '@/pages/drv/DRVsPage.jsx';
import CreateDRVPage from '@/pages/drv/CreateDRVPage.jsx';
import EditDRVPage from '@/pages/drv/EditDRVPage.jsx';
import DRVDetailPage from '@/pages/drv/DRVDetailPage.jsx';
import ManageCutsPage from '@/pages/drv/ManageCutsPage.jsx';
import HistoryPage from '@/pages/drv/HistoryPage.jsx';
import DRVReportsPage from '@/pages/drv/DRVReportsPage.jsx';
import AuditTrailPage from '@/pages/drv/AuditTrailPage.jsx';

// Control Recepcion specific imports
import ControlRecepcionPage from '@/pages/control-recepcion/ControlRecepcionPage.jsx';
import CreateControlRecepcionPage from '@/pages/control-recepcion/CreateControlRecepcionPage.jsx';
import EditControlRecepcionPage from '@/pages/control-recepcion/EditControlRecepcionPage.jsx';
import ControlRecepcionReportsPage from '@/pages/control-recepcion/ControlRecepcionReportsPage.jsx';

// Requested Modules
import ATQsPage from '@/pages/atqs/ATQsPage.jsx';
import CreateATQPage from '@/pages/atqs/CreateATQPage.jsx';
import EditATQPage from '@/pages/atqs/EditATQPage.jsx';
import ATQDetailPage from '@/pages/atqs/ATQDetailPage.jsx';
import ClientesPage from '@/pages/ClientesPage.jsx';

// Proveedores Module specific imports
import ProveedoresPage from '@/pages/ProveedoresPage.jsx';
import CreateProveedorPage from '@/pages/proveedores/CreateProveedorPage.jsx';
import EditProveedorPage from '@/pages/proveedores/EditProveedorPage.jsx';
import ProveedorDetailPage from '@/pages/proveedores/ProveedorDetailPage.jsx';

// Carga Module specific imports
import CargaPage from '@/pages/carga/CargaPage.jsx';
import CreateCargaPage from '@/pages/carga/CreateCargaPage.jsx';
import EditCargaPage from '@/pages/carga/EditCargaPage.jsx';
import CargaDetailPage from '@/pages/carga/CargaDetailPage.jsx';
import RegistrarLecturaPage from '@/pages/carga/RegistrarLecturaPage.jsx';
import GestionarCortesPage from '@/pages/carga/GestionarCortesPage.jsx';
import HistorialCortesPage from '@/pages/carga/HistorialCortesPage.jsx';

// Estaciones Module specific imports
import EstacionesPage from '@/pages/estaciones/EstacionesPage.jsx';
import CreateEstacionPage from '@/pages/estaciones/CreateEstacionPage.jsx';
import EditEstacionPage from '@/pages/estaciones/EditEstacionPage.jsx';
import EstacionDetailPage from '@/pages/estaciones/EstacionDetailPage.jsx';

// Zonas Module specific imports
import ZonasPage from '@/pages/zonas/ZonasPage.jsx';
import CreateZonaPage from '@/pages/zonas/CreateZonaPage.jsx';
import EditZonaPage from '@/pages/zonas/EditZonaPage.jsx';
import ZonaDetailPage from '@/pages/zonas/ZonaDetailPage.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/notificaciones" element={<ProtectedRoute><NotificacionesPage /></ProtectedRoute>} />
      
      {/* Settings & Configuration Routes */}
      <Route path="/configuracion" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Configuración"><ConfiguracionPage /></ProtectedRoute>} />
      <Route path="/configuracion/modulos" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Configuración"><ModulosConfigPage /></ProtectedRoute>} />
      <Route path="/diagnostico-modulos" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Configuración"><ModuleDiagnosticPage /></ProtectedRoute>} />
      <Route path="/logotipos" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Configuración"><LogotiposPage /></ProtectedRoute>} />
      <Route path="/usuarios" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Usuarios"><UsuariosPage /></ProtectedRoute>} />
      
      {/* ATQs Modules Routes */}
      <Route path="/atqs" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="GESTIÓN DE ATQs"><ATQsPage /></ProtectedRoute>} />
      <Route path="/atqs/crear" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="GESTIÓN DE ATQs"><CreateATQPage /></ProtectedRoute>} />
      <Route path="/atqs/editar/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="GESTIÓN DE ATQs"><EditATQPage /></ProtectedRoute>} />
      <Route path="/atqs/detalle/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="GESTIÓN DE ATQs"><ATQDetailPage /></ProtectedRoute>} />
      
      {/* Proveedores Module Routes */}
      <Route path="/proveedores" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Proveedores"><ProveedoresPage /></ProtectedRoute>} />
      <Route path="/proveedores/nuevo" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Proveedores"><CreateProveedorPage /></ProtectedRoute>} />
      <Route path="/proveedores/editar/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Proveedores"><EditProveedorPage /></ProtectedRoute>} />
      <Route path="/proveedores/detalle/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Proveedores"><ProveedorDetailPage /></ProtectedRoute>} />

      <Route path="/clientes" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador', 'Recepcion']} moduleName="Clientes"><ClientesPage /></ProtectedRoute>} />
      
      {/* Estaciones Module Routes */}
      <Route path="/estaciones" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Catálogo de Estaciones"><EstacionesPage /></ProtectedRoute>} />
      <Route path="/estaciones/nuevo" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Catálogo de Estaciones"><CreateEstacionPage /></ProtectedRoute>} />
      <Route path="/estaciones/editar/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Catálogo de Estaciones"><EditEstacionPage /></ProtectedRoute>} />
      <Route path="/estaciones/detalle/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Catálogo de Estaciones"><EstacionDetailPage /></ProtectedRoute>} />

      {/* Carga Module Routes */}
      <Route path="/carga" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Control de Carga"><CargaPage /></ProtectedRoute>} />
      <Route path="/carga/nuevo" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Control de Carga"><CreateCargaPage /></ProtectedRoute>} />
      <Route path="/carga/editar/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Control de Carga"><EditCargaPage /></ProtectedRoute>} />
      <Route path="/carga/detalle/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Control de Carga"><CargaDetailPage /></ProtectedRoute>} />
      <Route path="/carga/lectura/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Control de Carga"><RegistrarLecturaPage /></ProtectedRoute>} />
      <Route path="/carga/cortes/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Control de Carga"><GestionarCortesPage /></ProtectedRoute>} />
      <Route path="/carga/historial/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Control de Carga"><HistorialCortesPage /></ProtectedRoute>} />

      {/* Control Recepcion Module Routes */}
      <Route path="/control-recepcion" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador', 'Recepcion']} moduleName="Control de Recepción"><ControlRecepcionPage /></ProtectedRoute>} />
      <Route path="/control-recepcion/crear" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador', 'Recepcion']} moduleName="Control de Recepción"><CreateControlRecepcionPage /></ProtectedRoute>} />
      <Route path="/control-recepcion/editar/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador', 'Recepcion']} moduleName="Control de Recepción"><EditControlRecepcionPage /></ProtectedRoute>} />
      <Route path="/control-recepcion/reportes" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador', 'Recepcion']} moduleName="Control de Recepción"><ControlRecepcionReportsPage /></ProtectedRoute>} />

      {/* DRV Module Routes */}
      <Route path="/drv" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador', 'Despachador']} moduleName="DRV"><DRVsPage /></ProtectedRoute>} />
      <Route path="/drv/crear" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="DRV"><CreateDRVPage /></ProtectedRoute>} />
      <Route path="/drv/editar/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="DRV"><EditDRVPage /></ProtectedRoute>} />
      <Route path="/drv/detalle/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador', 'Despachador']} moduleName="DRV"><DRVDetailPage /></ProtectedRoute>} />
      <Route path="/drv/cortes" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador', 'Despachador']} moduleName="DRV"><ManageCutsPage /></ProtectedRoute>} />
      <Route path="/drv/historial" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador', 'Despachador']} moduleName="DRV"><HistoryPage /></ProtectedRoute>} />
      <Route path="/drv/reportes" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador', 'Despachador']} moduleName="DRV"><DRVReportsPage /></ProtectedRoute>} />
      <Route path="/drv/auditoria" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="DRV"><AuditTrailPage /></ProtectedRoute>} />

      {/* Zonas Module Routes */}
      <Route path="/zonas" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Zonas"><ZonasPage /></ProtectedRoute>} />
      <Route path="/zonas/nuevo" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Zonas"><CreateZonaPage /></ProtectedRoute>} />
      <Route path="/zonas/editar/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Zonas"><EditZonaPage /></ProtectedRoute>} />
      <Route path="/zonas/detalle/:id" element={<ProtectedRoute allowedRoles={['Superadmin', 'Administrador']} moduleName="Zonas"><ZonaDetailPage /></ProtectedRoute>} />

      {/* Catch-all Route */}
      <Route path="*" element={
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 bg-background">
          <h1 className="text-6xl font-black text-primary/20 mb-4 tracking-tighter">404</h1>
          <p className="text-foreground font-semibold text-xl mb-2 max-w-md mx-auto">Página no encontrada</p>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">La página que buscas no existe o el módulo asociado se encuentra inactivo.</p>
          <a href="/dashboard" className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">Volver al Panel</a>
        </div>
      } />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ModulosProvider>
          <ScrollToTop />
          <AppRoutes />
          <Toaster position="top-right" richColors closeButton />
        </ModulosProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;