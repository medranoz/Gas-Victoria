import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { LayoutDashboard, Users, ShoppingCart, MapPin, Fuel, Package, CalendarClock, BarChart3, Settings, Bell, FileText, Activity } from 'lucide-react';

const ICONS = [
  { name: 'LayoutDashboard', icon: LayoutDashboard },
  { name: 'Users', icon: Users },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'MapPin', icon: MapPin },
  { name: 'Fuel', icon: Fuel },
  { name: 'Package', icon: Package },
  { name: 'CalendarClock', icon: CalendarClock },
  { name: 'BarChart3', icon: BarChart3 },
  { name: 'Settings', icon: Settings },
  { name: 'Bell', icon: Bell },
  { name: 'FileText', icon: FileText },
  { name: 'Activity', icon: Activity },
];

const IconSelector = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecciona un icono" />
      </SelectTrigger>
      <SelectContent>
        {ICONS.map((item) => {
          const Icon = item.icon;
          return (
            <SelectItem key={item.name} value={item.name}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default IconSelector;