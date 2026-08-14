import { NextRequest, NextResponse } from "next/server";

// ATENCION: preencher essas variaveis assim que tiver os dados reais do cadastro
// "Software Propio" na DIAN. Ate la, essa rota nao deve ser chamada em producao.
const DIAN_CONFIG = {
  identificacion_software: process.env.DIAN_SOFTWARE_ID || "PREENCHER",
  clave_tecnica: process.env.DIAN_CLAVE_TECNICA || "PREENCHER",
  pin_software: process.env.DIAN_PIN || "PREENCHER",
  ruta_certificado: process.env.DIAN_CERT_PATH || "PREENCHER",
  clave_certificado: process.env.DIAN_CERT_PASS || "PREENCHER",
  nit_emisor: process.env.DIAN_NIT || "PREENCHER",
  razon_social: process.env.DIAN_RAZON_SOCIAL || "Academia Haas",
  municipio: process.env.DIAN_MUNICIPIO || "PREENCHER",
  departamento: process.env.DIAN_DEPARTAMENTO || "PREENCHER"
};

const FAVI_ENDPOINT = "http://dev.enlote.co/api/v1/factura/xml";

export async function POST(req: NextRequest) {
  if (DIAN_CONFIG.identificacion_software === "PREENCHER") {
    return NextResponse.json({
      error: "Facturacion electronica aun no configurada. Falta el registro como Software Propio en la DIAN."
    }, { status: 501 });
  }

  try {
    const { nit_comprador, nombre_comprador, email_comprador, valor, descripcion } = await req.json();

    // TODO: montar o JSON completo (documento, numeracion, emisor, adquiriente, detalle)
    // seguindo a estrutura da documentacao do Favi, assim que tivermos os dados reais.

    return NextResponse.json({ error: "Integracao pendiente de datos reales." }, { status: 501 });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
