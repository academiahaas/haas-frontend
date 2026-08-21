const TITULO = "Inglés para el Trabajo";
const BASE = "http://localhost:3005";

// níveis já salvos (id + dados usados na geração dos módulos)
const niveis = [
  { id: "093b9feb-a0e0-4df5-b11e-af1b2eefbf1b", level_tag: "A1", level_name: "Inglés básico para el trabajo", pedagogical_focus: null, total_hours: 81 },
  { id: "e461f24b-bae1-4338-99f9-3f6dd3eb66ca", level_tag: "A2", level_name: "Inglés elemental para el trabajo", pedagogical_focus: null, total_hours: 108 },
  { id: "f9403c23-6586-48c1-9110-be1a2a1b7db3", level_tag: "B1", level_name: "Inglés intermedio para el trabajo", pedagogical_focus: null, total_hours: 135 },
  { id: "e5622545-ddc7-4874-9643-d55158cb9be3", level_tag: "B2", level_name: "Inglés intermedio-alto para el trabajo", pedagogical_focus: null, total_hours: 162 },
  { id: "0b78afe4-d9ce-42da-a091-2bda19715e82", level_tag: "C1", level_name: "Inglés avanzado para el trabajo", pedagogical_focus: null, total_hours: 189 },
];

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`${path} -> ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  // busca pedagogical_focus salvo no banco (não guardamos em memória local)
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/levels?course_id=eq.8f73b9e1-2c4d-4a1b-9f8e-d7a6c5b4e3f2&select=id,pedagogical_focus`, {
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
  });
  const focos = await res.json();
  niveis.forEach(n => { n.pedagogical_focus = focos.find(f => f.id === n.id)?.pedagogical_focus || ""; });

  let modulosJaCriados = [];

  for (const nivel of niveis) {
    console.log(`\n=== Nível ${nivel.level_tag} - ${nivel.level_name} ===`);
    console.log("Gerando títulos de módulo...");

    const geraModulos = await post("/api/admin/curso-wizard/modulos", {
      titulo_curso: TITULO,
      level_tag: nivel.level_tag,
      level_name: nivel.level_name,
      pedagogical_focus: nivel.pedagogical_focus,
      total_hours: nivel.total_hours,
      modulos_ja_criados: modulosJaCriados,
      quantidade_modulos: 4,
    });

    const modulosBrutos = geraModulos.dados.modulos;
    const modulosCompletos = [];

    for (const m of modulosBrutos) {
      console.log(`  Gerando objetivo pedagógico: ${m.module_title}`);
      const obj = await post("/api/admin/curso-wizard/objetivo-modulo", {
        titulo_curso: TITULO,
        level_tag: nivel.level_tag,
        level_focus: nivel.pedagogical_focus,
        module_title: m.module_title,
        estimated_hours: m.estimated_hours,
      });
      modulosCompletos.push({
        module_number: m.module_number,
        module_title: m.module_title,
        estimated_hours: m.estimated_hours,
        pedagogical_objective: obj.dados.pedagogical_objective,
        thematic_content: obj.dados.thematic_content,
      });
    }

    console.log(`  Salvando ${modulosCompletos.length} módulo(s) do nível ${nivel.level_tag}...`);
    const salvo = await post("/api/admin/curso-wizard/salvar-modulos", {
      level_id: nivel.id,
      level_tag: nivel.level_tag,
      modulos: modulosCompletos,
    });
    console.log(`  OK: ${salvo.modulos.length} módulo(s) salvos.`);

    modulosJaCriados = modulosJaCriados.concat(modulosCompletos);
  }

  console.log("\n=== MÓDULOS CONCLUÍDOS ===");
}

main().catch((e) => { console.error("ERRO:", e.message); process.exit(1); });
