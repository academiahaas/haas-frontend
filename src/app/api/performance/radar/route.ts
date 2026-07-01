// @ts-nocheck
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Retornamos una estructura base limpia para el Radar de proficiencia hiperpersonalizado
    const datosRadarBase = [
      { competenca: 'Fala', nota: 70 },
      { competenca: 'Escuta', nota: 75 },
      { competenca: 'Gramática', nota: 80 },
      { competenca: 'Escrita', nota: 60 },
      { competenca: 'Leitura', nota: 65 }
    ];

    return NextResponse.json({ success: true, data: datosRadarBase });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
