import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useModulos, getModulePath } from '@/contexts/ModulosContext.jsx';
import { getIcon } from '@/lib/iconMap.js';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { getLogoCacheUrl } from '@/lib/logoUploadUtil.js';
import { getUserDisplayName } from '@/lib/utils.js';

const RecepcionDashboard = () => {
  const { currentUser } = useAuth();
  const { getModulosByUbicacion } = useModulos();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[RecepcionDashboard] Logo fetch timeout reached (10000ms)');
      controller.abort();
    }, 10000); // 10 second timeout

    const fetchLogo = async () => {
      try {
        console.log('[RecepcionDashboard] Fetching logo start...');
        const record = await pb.collection('logotipos').getFirstListItem('tipo="header"', {
          $autoCancel: false,
          signal: controller.signal
        });
        
        if (isMounted && record && record.archivo) {
          const url = pb.files.getURL(record, record.archivo);
          setLogoUrl(getLogoCacheUrl(url));
          setLogoError(false);
          console.log('[RecepcionDashboard] Logo fetched successfully.');
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.isAbort) {
          console.log('[RecepcionDashboard] Logo fetch aborted (expected on cleanup)');
          return; // Don't treat abort as error
        }
        if (isMounted) {
          console.error('[RecepcionDashboard] Logo fetch error:', err);
          setLogoError(true);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };
    
    fetchLogo();
    
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - run once on mount

  const dashboardModules = getModulosByUbicacion('Sección Dashboard').filter(m => {
    if (!m.roles_permitidos || m.roles_permitidos.length === 0) return true;
    return m.roles_permitidos.map(r => r.toLowerCase()).includes(currentUser?.role?.toLowerCase() || '');
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">BIENVENIDO, {getUserDisplayName(currentUser)}</h2>
          <p className="text-muted-foreground mt-2">Colección de Módulos - Aquí podrás ver tus aplicaciones disponibles</p>
        </div>
        {logoUrl && !logoError && (
          <div className="hidden sm:block p-3 bg-card border shadow-sm rounded-xl">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-10 w-auto object-contain opacity-90"
              onError={() => setLogoError(true)} 
            />
          </div>
        )}
      </div>

      {dashboardModules.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground bg-muted/20 border rounded-2xl border-dashed">
          <p>No tienes módulos configurados para este dashboard.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboardModules.map(module => {
            const IconComponent = getIcon(module.icono);
            return (
              <Card key={module.id} className="hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 overflow-hidden group" onClick={() => navigate(getModulePath(module.nombre))}>
                <CardHeader className="flex flex-col items-start gap-4">
                  <div className="bg-primary/10 p-3.5 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-1.5">{module.nombre}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      Acceder a la gestión de {module.nombre.toLowerCase()}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecepcionDashboard;