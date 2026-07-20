import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useConfiguracion } from '@/hooks/useConfiguracion.js';
import { useNotificationSystem } from '@/hooks/useNotificationSystem.js';
import { useModulos, getModulePath } from '@/contexts/ModulosContext.jsx';
import { getIcon } from '@/lib/iconMap.js';
import { getUserDisplayName } from '@/lib/utils.js';
import { checkMaintenanceNotifications } from '@/lib/maintenanceNotifier.js';
import { Button } from '@/components/ui/button.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';
import { Flame, User, LogOut, Settings, Users, Gauge, ShieldAlert, History, Scissors, LayoutDashboard, Image as ImageIcon, ClipboardList, Truck, Building, Building2, DatabaseZap, RefreshCw, FileText, Bell } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import ModulosSyncIndicator from '@/components/ModulosSyncIndicator.jsx';
import { getLogoCacheUrl } from '@/lib/logoUploadUtil.js';

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { getConfiguracion } = useConfiguracion();
  const { getUnreadCount } = useNotificationSystem();
  const { getModulosByUbicacion, getActiveModulos, refreshModulos } = useModulos();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [configData, setConfigData] = useState({ nombre_empresa: 'GAS VICTORIA' });
  const [customLogoUrl, setCustomLogoUrl] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path) && path !== '/' || (path === '/' && location.pathname === '/');
  const userRole = currentUser?.role?.toLowerCase();
  const isSuperadminOrAdmin = userRole === 'superadmin' || userRole === 'administrador';
  const hasOperationAccess = isSuperadminOrAdmin || userRole === 'despachador' || userRole === 'recepcion';

  const activeNames = getActiveModulos().map(m => m.nombre?.toLowerCase() || '');
  const isModuleActive = (name) => activeNames.includes(name.toLowerCase());

  const navModules = getModulosByUbicacion('Header Principal').filter(m => {
    if (!m.roles_permitidos || m.roles_permitidos.length === 0) return true;
    return m.roles_permitidos.map(r => r.toLowerCase()).includes(userRole);
  });

  useEffect(() => {
    let isMounted = true;
    const fetchConfigAndLogo = async () => {
      try {
        const res = await getConfiguracion();
        if (isMounted && res && res.success) setConfigData(prev => ({ ...prev, nombre_empresa: res.nombre_empresa || 'GAS VICTORIA' }));
        const record = await pb.collection('logotipos').getFirstListItem('tipo="header"', { $autoCancel: false }).catch(()=>null);
        if (isMounted && record && record.archivo) {
          setCustomLogoUrl(getLogoCacheUrl(pb.files.getURL(record, record.archivo)));
          setLogoError(false);
        }
      } catch (err) {
        if (isMounted) setLogoError(true);
      }
    };
    fetchConfigAndLogo();
    return () => { isMounted = false; };
  }, [getConfiguracion]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) return;
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        // Ejecutar chequeo de mantenimiento de ATQs en segundo plano
        if (isSuperadminOrAdmin) {
          await checkMaintenanceNotifications(currentUser.id).catch(() => {});
        }
        
        const countRes = await getUnreadCount(currentUser.id);
        if (isMounted && countRes.success) setUnreadCount(countRes.count);
      } catch (error) {
        // Suppress generic network errors inside header notification polling
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [isAuthenticated, currentUser, getUnreadCount, isSuperadminOrAdmin]);

  const handleReloadModules = async () => {
    setIsReloading(true);
    try {
      await refreshModulos(true);
      toast.success('Módulos recargados correctamente');
    } catch (e) {
      toast.error('Error al recargar módulos');
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-lg hover:opacity-80 transition-opacity">
            {customLogoUrl && !logoError ? (
              <img src={customLogoUrl} alt={configData.nombre_empresa} className="h-8 md:h-10 w-auto object-contain" onError={() => setLogoError(true)} />
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg"><Flame className="w-5 h-5 text-primary" /></div>
                <span className="text-foreground font-extrabold uppercase hidden sm:inline-block">{configData.nombre_empresa}</span>
              </div>
            )}
          </Link>

          {isAuthenticated ? (
            <nav className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
              <div className="hidden lg:flex items-center gap-6 mr-2">
                {navModules.map(module => {
                  const IconComponent = getIcon(module.icono);
                  const path = getModulePath(module.nombre);
                  return (
                    <Link key={module.id} to={path} className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${isActive(path) ? 'text-primary' : 'text-foreground/80'}`}>
                      <IconComponent className="inline-block w-4 h-4 mr-1.5 mb-0.5" />
                      {module.nombre}
                    </Link>
                  );
                })}

                {hasOperationAccess && (isModuleActive('atqs') || isModuleActive('gestión de atqs')) && (
                  <Link to="/atqs" className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${isActive('/atqs') ? 'text-primary' : 'text-foreground/80'}`}>
                    <Truck className="inline-block w-4 h-4 mr-1.5 mb-0.5" /> ATQs
                  </Link>
                )}

                {hasOperationAccess && isModuleActive('proveedores') && (
                  <Link to="/proveedores" className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${isActive('/proveedores') ? 'text-primary' : 'text-foreground/80'}`}>
                    <Building className="inline-block w-4 h-4 mr-1.5 mb-0.5" /> Proveedores
                  </Link>
                )}

                {hasOperationAccess && isModuleActive('clientes') && (
                  <Link to="/clientes" className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${isActive('/clientes') ? 'text-primary' : 'text-foreground/80'}`}>
                    <Users className="inline-block w-4 h-4 mr-1.5 mb-0.5" /> Clientes
                  </Link>
                )}

                {hasOperationAccess && (isModuleActive('estaciones') || isModuleActive('catálogo de estaciones')) && (
                  <Link to="/estaciones" className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${isActive('/estaciones') ? 'text-primary' : 'text-foreground/80'}`}>
                    <Building2 className="inline-block w-4 h-4 mr-1.5 mb-0.5" /> Estaciones
                  </Link>
                )}

                {hasOperationAccess && isModuleActive('control de carga') && (
                  <Link to="/carga" className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${isActive('/carga') ? 'text-primary' : 'text-foreground/80'}`}>
                    <DatabaseZap className="inline-block w-4 h-4 mr-1.5 mb-0.5" /> Carga
                  </Link>
                )}

                {hasOperationAccess && isModuleActive('control de recepción') && (
                  <Link to="/control-recepcion" className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${isActive('/control-recepcion') ? 'text-primary' : 'text-foreground/80'}`}>
                    <ClipboardList className="inline-block w-4 h-4 mr-1.5 mb-0.5" /> Recepción
                  </Link>
                )}

                {hasOperationAccess && isModuleActive('drv') && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap outline-none ${isActive('/drv') ? 'text-primary' : 'text-foreground/80'}`}>
                      <Gauge className="inline-block w-4 h-4 mr-1.5 mb-0.5" /> DRV
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => navigate('/drv')}><Gauge className="mr-2 h-4 w-4"/> Catálogo DRV</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/drv/cortes')}><Scissors className="mr-2 h-4 w-4"/> Registrar Corte</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/drv/historial')}><History className="mr-2 h-4 w-4"/> Historial de Cortes</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/drv/reportes')}><FileText className="mr-2 h-4 w-4"/> Reportes</DropdownMenuItem>
                      {isSuperadminOrAdmin && (
                        <DropdownMenuItem onClick={() => navigate('/drv/auditoria')}><ShieldAlert className="mr-2 h-4 w-4"/> Auditoría DRV</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="flex items-center gap-1">
                <ModulosSyncIndicator />
                
                <TooltipProvider delayDuration={300}>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/notificaciones')}
                        className="relative hover:bg-muted focus-visible:ring-2 rounded-full"
                      >
                        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-primary' : 'text-foreground/70'}`} />
                        {unreadCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Notificaciones ({unreadCount})</p></TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleReloadModules}
                        disabled={isReloading}
                        className="hidden sm:flex transition-colors focus-visible:ring-2 rounded-full"
                      >
                        <RefreshCw className={`w-5 h-5 ${isReloading ? 'animate-spin' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Recargar módulos</p></TooltipContent>
                  </Tooltip>

                  {isSuperadminOrAdmin && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => navigate('/usuarios')}
                            className={`hidden sm:flex transition-colors focus-visible:ring-2 rounded-full ${isActive('/usuarios') ? 'bg-muted text-primary' : ''}`}
                          >
                            <Users className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Gestión de Usuarios</p></TooltipContent>
                      </Tooltip>

                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`hidden sm:flex transition-colors focus-visible:ring-2 rounded-full ${isActive('/configuracion') || isActive('/logotipos') ? 'bg-muted text-primary' : ''}`}
                              >
                                <Settings className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent><p>Configuración del Sistema</p></TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border/50">
                          <div className="flex items-center justify-between px-3 py-2 font-medium border-b border-border/50 text-sm bg-muted/20">
                            <span>Sistema</span>
                          </div>
                          <DropdownMenuItem onClick={() => navigate('/configuracion')} className="cursor-pointer py-2.5 hover:bg-accent/50">
                            <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" /> Ajustes Generales
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/configuracion/modulos')} className="cursor-pointer py-2.5 hover:bg-accent/50">
                            <LayoutDashboard className="mr-2.5 h-4 w-4 text-muted-foreground" /> Gestión de Módulos
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/logotipos')} className="cursor-pointer py-2.5 hover:bg-accent/50">
                            <ImageIcon className="mr-2.5 h-4 w-4 text-muted-foreground" /> Logotipos y Diseño
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 px-3 hover:bg-muted rounded-full ml-1">
                      <div className="bg-primary text-primary-foreground p-1 rounded-md"><User className="w-4 h-4" /></div>
                      <span className="hidden md:inline font-medium max-w-[120px] truncate">{getUserDisplayName(currentUser)}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuItem onClick={logout} className="text-destructive font-medium hover:bg-destructive hover:text-destructive-foreground">
                      <LogOut className="w-4 h-4 mr-2.5" /> Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </nav>
          ) : (
            <Link to="/login"><Button size="sm">Iniciar sesión</Button></Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;