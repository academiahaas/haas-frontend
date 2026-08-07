path = './src/app/portal-aluno/components/PortalMobile.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

codigo_busca = """
  // State e Effect para busca dinamica de horarios no Supabase
  const [horariosDoBanco, setHorariosDoBanco] = React.useState<string[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = React.useState(false);

  React.useEffect(() => {
    async function buscarHorariosReais() {
      if (!gavetaHorariosAberta || !diaSelecionado) return;
      
      setCarregandoHorarios(true);
      console.log('🔥 [SUPABASE] Buscando horarios para dia:', diaSelecionado, 'mes:', mesAgendamento);

      try {
        const ano = 2026;
        const mesStr = String(mesAgendamento).padStart(2, '0');
        const diaStr = String(diaSelecionado).padStart(2, '0');
        
        const inicioDia = `${ano}-${mesStr}-${diaStr}T00:00:00+00:00`;
        const fimDia = `${ano}-${mesStr}-${diaStr}T23:59:59+00:00`;

        const { data, error } = await supabase
          .from('aulas_disponiveis')
          .select('*')
          .gte('data_hora_inicio', inicioDia)
          .lte('data_hora_inicio', fimDia)
          .eq('status', 'DISPONIVEL');

        if (error) {
          console.error('❌ Erro Supabase:', error.message);
          setHorariosDoBanco([]);
        } else if (data) {
          const horasUnicas = Array.from(new Set(
            data.map((aula: any) => {
              const horaStr = String(aula.data_hora_inicio);
              const match = horaStr.match(/T(\d{2}:\d{2})/);
              return match ? match[1] : horaStr.substring(11, 16);
            })
          )).sort();

          setHorariosDoBanco(horasUnicas);
        }
      } catch (err) {
        console.error('❌ Exceção ao buscar horarios:', err);
      } finally {
        setCarregandoHorarios(false);
      }
    }

    buscarHorariosReais();
  }, [gavetaHorariosAberta, diaSelecionado, mesAgendamento]);
"""

if "const [horariosDoBanco, setHorariosDoBanco]" in content:
    import re
    pattern = r"// State e Effect para busca dinamica.*?\n  \}, \[gavetaHorariosAberta, diaSelecionado, mesAgendamento\]\);"
    content = re.sub(pattern, codigo_busca.strip(), content, flags=re.DOTALL)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Ajuste aplicado com sucesso!")
