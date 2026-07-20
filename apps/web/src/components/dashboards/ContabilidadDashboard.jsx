import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useModulos, getModulePath } from '@/contexts/ModulosContext.jsx';
import { getIcon } from '@/lib/iconMap.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';

const ContabilidadDashboard = () => {
  const { currentUser } = useAuth();
  const { getModulosByUbicacion } = useModulos();
  const navigate = useNavigate();

  // Dynamic modules from context mapping
  const dashboardModules = getModulosByUbicacion('Sección Dashboard').filter(m => {
    if (!m.roles_permitidos || m.roles_permitidos.length === 0) return true;
    return m.roles_permitidos.map(r => r.toLowerCase()).includes(currentUser?.role?.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Panel de Contabilidad</h2>
        <p className="text-muted-foreground mt-2">Herramientas de conciliación y reportes financieros</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardModules.map(module => {
          const IconComponent = getIcon(module.icono);
          return (
            <Card key={module.id} className="hover:border-primary/50 transition-all duration-200 cursor-pointer" onClick={() => navigate(getModulePath(module.nombre))}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{module.nombre}</CardTitle>
                  <CardDescription className="text-xs">Ir a {module.nombre.toLowerCase()}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
        {dashboardModules.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl">
            No tienes módulos configurados para este perfil.
          </div>
        )}
      </div>
    </div>
  );
};

export default ContabilidadDashboard;