import React from 'react';
import { LayoutDashboard, Users, ShoppingCart, MapPin, Fuel, Package, CalendarClock, BarChart3, GripVertical, Settings, User } from 'lucide-react';
import { Card } from '@/components/ui/card.jsx';

const iconMap = {
  'Dashboard': LayoutDashboard,
  'Clientes': Users,
  'Ventas': ShoppingCart,
  'Zonas': MapPin,
  'Tanques': Fuel,
  'Proveedores': Package,
  'Recordatorios': CalendarClock,
  'Reportes': BarChart3
};

const ModulosPreview = ({ modulos }) => {
  // Sort modules by 'orden' and filter active
  const activeModules = modulos.filter(m => m.estado).sort((a, b) => a.orden - b.orden);
  
  const headerModules = activeModules.filter(m => m.ubicacion === 'Header Principal');
  const dashModules = activeModules.filter(m => m.ubicacion === 'Sección Dashboard');

  return (
    <div className="w-full flex flex-col gap-6 p-6 bg-[hsl(var(--config-preview-bg))] border border-[hsl(var(--config-preview-border))] rounded-2xl shadow-inner">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
        </div>
        <span className="text-xs font-medium text-muted-foreground ml-2">Vista Previa de Interfaz</span>
      </div>

      {/* Mock Header */}
      <div className="w-full h-14 bg-background border rounded-xl flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-sm">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground text-[10px]">G</span>
          </div>
          <span className="hidden sm:inline-block">Gas Victoria</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          {headerModules.length > 0 ? (
            headerModules.map(mod => {
              const Icon = iconMap[mod.nombre] || GripVertical;
              return (
                <div key={mod.id} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline-block">{mod.nombre}</span>
                </div>
              );
            })
          ) : (
            <span className="italic opacity-50 text-[10px]">Sin módulos en header</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <User className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Mock Dashboard Area */}
      <div className="flex-1 bg-background/50 border border-dashed rounded-xl p-6 min-h-[300px]">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground">Dashboard General</h3>
          <p className="text-xs text-muted-foreground">Bienvenido de nuevo</p>
        </div>

        {dashModules.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dashModules.map(mod => {
              const Icon = iconMap[mod.nombre] || Settings;
              return (
                <Card key={mod.id} className="p-4 flex flex-col items-center justify-center gap-3 bg-card shadow-sm border border-border/60">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{mod.nombre}</span>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-32 flex items-center justify-center bg-muted/30 border border-dashed rounded-lg">
            <span className="text-sm text-muted-foreground italic">Sin módulos en la sección del Dashboard</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulosPreview;