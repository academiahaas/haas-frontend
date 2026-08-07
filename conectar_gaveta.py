path = './src/app/portal-aluno/components/PortalMobile.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False

for line in lines:
    if '<div className="grid grid-cols-2 gap-2 w-full">' in line:
        new_lines.append(line)
        new_lines.append("                    {horariosDoBanco.length === 0 ? (\n")
        new_lines.append("                      <div className=\"col-span-2 py-8 text-center text-slate-500 font-mono text-xs uppercase tracking-wider\">\n")
        new_lines.append("                        {carregandoHorarios ? \"Carregando horários...\" : \"Nenhum horário disponível.\"}\n")
        new_lines.append("                      </div>\n")
        new_lines.append("                    ) : (\n")
        new_lines.append("                      horariosDoBanco.map((h) => {\n")
        new_lines.append("                        const isSelected = horarioSelecionado === h;\n")
        new_lines.append("                        return (\n")
        new_lines.append("                          <button\n")
        new_lines.append("                            key={h}\n")
        new_lines.append("                            onClick={() => setHorarioSelecionado(h)}\n")
        new_lines.append("                            className={`py-2.5 md:py-4 rounded-xl text-center font-mono text-[clamp(13px,3.8vw,15px)] md:text-lg font-bold transition-all cursor-pointer border border-transparent ${\n")
        new_lines.append("                              isSelected\n")
        new_lines.append("                                ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/10'\n")
        new_lines.append("                                : 'bg-slate-900/40 border-white/[0.03] text-slate-300'\n")
        new_lines.append("                            }`}\n")
        new_lines.append("                          >\n")
        new_lines.append("                            {h}\n")
        new_lines.append("                          </button>\n")
        new_lines.append("                        );\n")
        new_lines.append("                      })\n")
        new_lines.append("                    )}\n")
        skip = True
    elif skip and '</div>' in line and not skip_inner:
        skip = False
        new_lines.append(line)
    elif not skip:
        new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✅ Conexão da gaveta finalizada!")
