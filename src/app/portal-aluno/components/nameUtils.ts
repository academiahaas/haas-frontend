import React from 'react';

/**
 * Retorna a primeira letra do sobrenome do aluno.
 * Exemplo: 'Juliana Reis' -> 'R'
 * Se houver apenas um nome: 'Juliana' -> 'J'
 */
export const getLastNameInitial = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 1) {
    const lastName = parts[parts.length - 1];
    return lastName.charAt(0).toUpperCase() || 'H';
  }
  return parts[0].charAt(0).toUpperCase() || 'H';
};

export default getLastNameInitial;
