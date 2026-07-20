import React from 'react';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Label } from '@/components/ui/label.jsx';

const ROLES = ['Superadmin', 'Administrador', 'Contabilidad', 'Recepcion', 'Despachador'];

const RoleSelector = ({ selectedRoles = [], onChange }) => {
  const handleToggle = (role) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    onChange(newRoles);
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/20">
      {ROLES.map(role => (
        <div key={role} className="flex items-center space-x-2">
          <Checkbox 
            id={`role-${role}`} 
            checked={selectedRoles.includes(role)}
            onCheckedChange={() => handleToggle(role)}
          />
          <Label htmlFor={`role-${role}`} className="text-sm cursor-pointer">
            {role}
          </Label>
        </div>
      ))}
    </div>
  );
};

export default RoleSelector;