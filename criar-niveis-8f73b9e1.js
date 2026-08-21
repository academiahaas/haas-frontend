const COURSE_ID = "8f73b9e1-2c4d-4a1b-9f8e-d7a6c5b4e3f2";
const TITULO = "Inglés para el Trabajo";
const BASE = "http://localhost:3005";

// dados já gerados pela chamada anterior a /niveis
const niveisBrutos = [
  { level_tag: "A1", level_name: "Inglés básico para el trabajo", total_hours: 81 },
  { level_tag: "A2", level_name: "Inglés elemental para el trabajo", total_hours: 108 },
  { level_tag: "B1", level_name: "Inglés intermedio para el trabajo", total_hours: 135 },
  { level_tag: "B2", level_name: "Inglés intermedio-alto para el trabajo", total_hours: 162 },
  { level_tag: "C1", level_name: "Inglés avanzado para el trabajo", total_hours: 189 },
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
  const niveisCompletos = [];

  for (const n of niveisBrutos) {
    console.log(`Gerando foco pedagógico: ${n.level_tag} - ${n.level_name}`);
    const r = await post("/api/admin/curso-wizard/objetivo-nivel", {
      titulo_curso: TITULO,
      level_tag: n.level_tag,
      level_name: n.level_name,
      total_hours: n.total_hours,
    });
    niveisCompletos.push({
      level_tag: n.level_tag,
      level_name: n.level_name,
      total_hours: n.total_hours,
      pedagogical_focus: r.dados.pedagogical_focus,
    });
  }

  console.log("Salvando níveis no banco...");
  const salvo = await post("/api/admin/curso-wizard/salvar-niveis", {
    course_id: COURSE_ID,
    niveis: niveisCompletos,
  });

  console.log("Níveis salvos:", JSON.stringify(salvo, null, 2));
}

main().catch((e) => { console.error("ERRO:", e.message); process.exit(1); });
