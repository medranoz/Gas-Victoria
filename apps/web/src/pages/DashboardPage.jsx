import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useModulos, getModulePath } from '@/contexts/ModulosContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { getIcon } from '@/lib/iconMap.js';
import { getUserDisplayName } from '@/lib/utils.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { ArrowUpRight, LayoutDashboard } from 'lucide-react';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { getActiveModulos } = useModulos();

  const userRole = currentUser?.role?.toLowerCase() || '';

  const accessibleModules = getActiveModulos().filter(m => {
    if (userRole === 'superadmin') return true;
    if (!m.roles_permitidos || m.roles_permitidos.length === 0) return true;
    return m.roles_permitidos.map(r => r.toLowerCase()).includes(userRole);
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Dashboard - Gas Victoria</title>
        <meta name="description" content="Panel de control principal de Gas Victoria." />
      </Helmet>
      
      <Header />
      
      <main className="flex-1 py-12 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground uppercase" style={{letterSpacing: '-0.02em'}}>
              BIENVENIDO, {getUserDisplayName(currentUser)}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Panel de control principal. Selecciona un módulo para comenzar a gestionar las operaciones.
          </p>
        </div>

        {accessibleModules.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border/50">
            <LayoutDashboard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground">No hay módulos disponibles</h3>
            <p className="text-muted-foreground mt-2">No tienes acceso a ningún módulo activo en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibleModules.map(module => {
              const Icon = getIcon(module.icono);
              const path = getModulePath(module.nombre);

              return (
                <Link key={module.id} to={path} className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 bg-card hover:border-primary/30">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="bg-primary/10 p-3 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          <Icon className="w-6 h-6" />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardTitle className="text-xl mt-5 font-bold">{module.nombre}</CardTitle>
                      <CardDescription className="text-sm mt-1.5 line-clamp-2 leading-relaxed">
                        {module.descripcion || `Acceder al módulo de ${module.nombre.toLowerCase()} para gestionar sus registros y configuraciones.`}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;