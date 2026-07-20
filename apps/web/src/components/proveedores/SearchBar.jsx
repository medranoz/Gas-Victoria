import React from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Buscar por razón social...' }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
};

export default SearchBar;