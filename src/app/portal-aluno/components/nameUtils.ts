import React from 'react';

/**
 * Retorna a inicial do primeiro nome + inicial do sobrenome.
 * Exemplo: 'Serafinooo OOoooO000' -> 'SO'
 * Exemplo: 'Juliana' -> 'J'
 */
export const getLastNameInitial = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') return 'H';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'H';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() || 'H';
  
  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

export default getLastNameInitial;
