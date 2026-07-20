import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useModulos, getModulePath } from '@/contexts/ModulosContext.jsx';
import { getIcon } from '@/lib/iconMap.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';

const DespachadorDashboard = () => {
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
        <h2 className="text-3xl font-bold tracking-tight">Panel de Operaciones</h2>
        <p className="text-muted-foreground mt-2">Herramientas operativas de rutas y recargas</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardModules.map(module => {
          const IconComponent = getIcon(module.icono);
          return (
            <Card key={module.id} className="hover:border-primary/50 transition-all duration-200 cursor-pointer" onClick={() => navigate(getModulePath(module.nombre))}>
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="bg-primary/10 p-4 rounded-full">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg mb-1">{module.nombre}</CardTitle>
                  <CardDescription className="text-xs">Acceder al módulo</CardDescription>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DespachadorDashboard;