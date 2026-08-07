const fs = require("fs");
const path = "src/app/portal-aluno/page.tsx";
let code = fs.readFileSync(path, "utf8");

const blocoSplitInjetavel = `            <div className="flex-1 bg-slate-50 rounded-2xl overflow-hidden p-3 border border-slate-100 shadow-inner">
              {mounted ? (
                <div className="w-full h-full flex flex-row items-center gap-2">
                  
                  {/* Lado Esquerdo: O Radar Expandido e Deslocado */}
                  <div className="w-[58%] h-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="82%" data={dadosRadar}>
                        <PolarGrid stroke="rgba(0,0,0,0.06)" />
                        <PolarAngleAxis dataKey="competenca" tick={{ fill: "#334155", fontSize: 8, fontWeight: "900" }} />
                        <PolarRadiusAxis tick={false} domain={[0, 100]} />
                        <Radar 
                          name="Proficiência" 
                          dataKey="nota" 
                          stroke="#8B5CF6" 
                          strokeWidth={2.5} 
                          fill="url(#radarPremiumGlow)" 
                          fillOpacity={0.3} 
                          className="drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]" 
                        />
                        <defs>
                          <linearGradient id="radarPremiumGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                          </linearGradient>
                        </defs>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Lado Direito: Barras Dinâmicas Preenchendo o Vazio */}
                  <div className="w-[42%] flex flex-col gap-1.5 border-l border-slate-200/60 pl-3">
                    {dadosRadar && dadosRadar.map((item, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex justify-between text-[9px] font-black text-slate-700 tracking-tight uppercase">
                          <span className="truncate max-w-[55px]">{item.competenca}</span>
                          <span className="font-mono text-[#8B5CF6] font-bold">{item.nota}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-0.5">
                          <div 
                            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]" 
                            style={{ width: `${item.nota}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ) : <div className="text-[10px] font-mono text-slate-400 animate-pulse">Sync...</div>}`;

let linhas = code.split("\n");

// Substituição cirúrgica na linha 280 (Índice 279 do array) até a linha 291
linhas.splice(279, 12, blocoSplitInjetavel);

fs.writeFileSync(path, linhas.join("\n"), "utf8");
console.log("💎 RETORNO: AJUSTE EXECUTADO SEM VAZAMENTO DE SINTAXE!");
