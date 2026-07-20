import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getUserDisplayName(user) {
  if (!user) return '';
  return (
    user.nombre ||
    user.nombre_referencia ||
    user.displayName ||
    user.fullName ||
    user.reference_name ||
    user.name ||
    user.email ||
    ''
  );
}