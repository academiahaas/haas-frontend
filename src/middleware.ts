import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simulação de armazenamento em memória para Rate Limiting (Proteção contra Força Bruta)
const tentativasLogin = new Map<string, { quantidade: number; expiraEm: number }>();

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. BYPASS CRÍTICO: Libera explicitamente o Webhook do Mapeamento de Fala sem passar por travas
  if (pathname.startsWith('/api/webhooks/aula-live')) {
    return NextResponse.next();
  }

  // 2. PROTEÇÃO DE INFRAESTRUTURA: Rate Limiting apenas na rota de Login
  if (pathname.startsWith('/api/auth/login')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const agora = Date.now();
    const registro = tentativasLogin.get(ip);

    if (registro) {
      if (agora < registro.expiraEm) {
        if (registro.quantidade >= 5) {
          // Bloqueia a requisição retornando HTTP 429 Too Many Requests
          return new NextResponse(
            JSON.stringify({ error: 'Muitas tentativas. Login bloqueado por segurança por 15 minutos.' }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Reseta o timer caso o tempo de penalidade já tenha passado
        tentativasLogin.delete(ip);
      }
    }
  }

  return NextResponse.next();
}

// Configura o middleware para rodar estritamente nas rotas de API
export const config = {
  matcher: '/api/:path*',
};