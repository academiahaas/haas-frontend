path = "src/app/portal-aluno/page.tsx"
with open(path, "r", encoding="utf-8") as f: text = f.read()
motor = """export default function PortalAluno() {
  const DATA_PROXIMA_AULA = "2026-06-20T19:00:00";
  const [tempoRestanteAula, setTempoRestanteAula] = useState(0);
  const [faseAula, setFaseAula] = useState("espera");
  useEffect(() => {
    const c = () => {
      const ag = new Date().getTime(), ho = new Date(DATA_PROXIMA_AULA).getTime(), d = Math.floor((ho - ag) / 1000);
      if (d > 600) { setFaseAula("espera"); setTempoRestanteAula(d); }
      else if (d <= 600 && d >= -1800) { setFaseAula("liberado"); setTempoRestanteAula(d); }
      else { setFaseAula("atrasado"); setTempoRestanteAula(Math.abs(d)); }
    };
    c(); const idx = setInterval(c, 1000); return () => clearInterval(idx);
  }, []);
  const formatarTempoAula = (s) => {
    const m = Math.floor(Math.abs(s) / 60), sg = Math.abs(s) % 60;
    return `${m.toString().padStart(2, "0")}:${sg.toString().padStart(2, "0")}`;
  };
"""
text = text.replace("export default function PortalAluno() {", motor)
alvo = """                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Sincronizando...</div>
                )}
              </div>"""
novo = """                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Sincronizando...</div>
                )}
              </div>
              <div onClick={() => { if (faseAula !== "espera") window.open("https://meet.google.com/abc-defg-hij", "_blank"); }} className={`bg-[#0A131C] border rounded-2xl p-3.5 flex flex-col justify-between shadow-2xl transition-all duration-300 select-none shrink-0 mt-3 ${faseAula === "espera" ? "border-dashed border-slate-700 text-slate-500 cursor-not-allowed" : faseAula === "liberado" ? "bg-emerald-500 text-black border-emerald-400 font-bold cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse hover:bg-emerald-600" : "bg-rose-600 text-white border-rose-500 font-bold cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:bg-rose-700"}`}>
                <span className={`text-[10px] font-black uppercase tracking-wider font-mono ${faseAula === "liberado" ? "text-slate-900" : "text-slate-500"}`}>{idioma === "PT" ? "AULA SÍNCRONA" : "CLASE SÍNCRONA"}</span>
                <div className="flex flex-col gap-0.5 mt-1.5">
                  <span className={`text-xs uppercase tracking-tight font-black font-mono leading-tight block ${faseAula === "liberado" ? "text-black" : ""}`}>{faseAula === "espera" ? (idioma === "PT" ? `A sua próxima aula é em: 20/06 às 19:00` : `Tu próxima clase es el: 20/06 a las 19:00`) : faseAula === "liberado" ? (idioma === "PT" ? `🚀 ENTRAR NA AULA AGORA (Faltam ${formatarTempoAula(tempoRestanteAula)})` : `🚀 ENTRAR A CLASE AHORA (Faltan ${formatarTempoAula(tempoRestanteAula)})`) : (idioma === "PT" ? `⚠️ SUA AULA JÁ COMEÇOU! (Atrasado ${formatarTempoAula(tempoRestanteAula)})` : `⚠️ ¡TU CLASE YA EMPEZÓ! (Retraso ${formatarTempoAula(tempoRestanteAula)})`)}</span>
                  <span className={`text-[9px] font-bold leading-tight block mt-1.5 ${faseAula === "liberado" ? "text-slate-800" : "text-slate-400"}`}>{faseAula === "espera" ? (idioma === "PT" ? "A entrada será feita por ali mesmo. O botão de ingresso será liberado 10 minutos antes." : "El ingreso se hará por allí mismo. El botón se liberará 10 minutos antes.") : faseAula === "liberado" ? (idioma === "PT" ? "Clique para abrir a sala e participar." : "Haz clic para abrir la sala y participar.") : (idioma === "PT" ? "Você está atrasado. Acesse agora para não perder o resto da aula!" : "Estás retrasado. ¡Accede ahora para no perder el resto!")}</span>
                </div>
              </div>"""
text = text.replace(alvo, novo)
for i in range(2):
    idx = text.find("{/* TRACKER */}")
    if idx != -1:
        end = text.find("</div>", idx + 50)
        end = text.find("</div>", end + 5)
        text = text[:idx] + text[end+6:]
with open(path, "w", encoding="utf-8") as f: f.write(text)
print("Aplicado com sucesso de ponta a ponta!")
