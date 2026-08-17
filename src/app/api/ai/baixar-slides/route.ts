import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const caminho = req.nextUrl.searchParams.get("path");
  if (!caminho) {
    return NextResponse.json({ error: "path obrigatorio" }, { status: 400 });
  }

  const resposta = await fetch(caminho);

  if (!resposta.ok) {
    return NextResponse.json({ error: "Arquivo nao encontrado" }, { status: 404 });
  }

  const buffer = await resposta.arrayBuffer();
  const nomeArquivo = caminho.split("/").pop() || "slides";
  const tipo = caminho.endsWith(".pptx")
    ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    : "application/pdf";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": tipo,
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`
    }
  });
}
