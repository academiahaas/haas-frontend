const fs = require("fs");
const path = "src/app/portal-aluno/page.tsx";
let code = fs.readFileSync(path, "utf8");

// 1. Injetar APENAS o Target (que é o único que estava faltando na linha 9)
if (code.includes("User, X, Shield, Box") && !code.includes("Target")) {
  code = code.replace(
    "User, X, Shield, Box",
    "User, X, Shield, Box, Target"
  );
}

// 2. Substituir a medalha 1 (🎯 Coesão) por <Target />
code = code.replace(
  '🎯 {idioma === \'PT\' ? \'Coesão\' : idioma === \'ES\' ? \'Cohesión\' : \'Cohesion\'}',
  '<Target size={11} className="text-amber-500 inline-block mr-1" /> {idioma === \'PT\' ? \'Coesão\' : idioma === \'ES\' ? \'Cohesión\' : \'Cohesion\'}'
);

// 3. Substituir a medalha 2 (🔥 12 Dias) por <Flame />
code = code.replace(
  '🔥 {idioma === \'PT\' ? \'12 Dias\' : idioma === \'ES\' ? \'12 Días\' : \'12 Days\'}',
  '<Flame size={11} className="text-orange-500 inline-block mr-1" /> {idioma === \'PT\' ? \'12 Dias\' : idioma === \'ES\' ? \'12 Días\' : \'12 Days\'}'
);

// 4. Substituir a medalha 3 (🛡️ Auditorias) por <Shield />
code = code.replace(
  '🛡️ {idioma === \'PT\' ? \'Auditorias\' : idioma === \'ES\' ? \'Auditorías\' : \'Audits\'}',
  '<Shield size={11} className="text-sky-400 inline-block mr-1" /> {idioma === \'PT\' ? \'Auditorias\' : idioma === \'ES\' ? \'Auditorías\' : \'Audits\'}'
);

fs.writeFileSync(path, code, "utf8");
console.log("💎 RETORNO HAAS: Mini-mural purificado sem duplicações de escopo!");
