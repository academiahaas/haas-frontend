const fs = require('fs');
const path = '/var/www/haas-frontend-desk-mobile-oficial/src/app/portal-aluno/components/ModalAgendaAluno.tsx';

let conteudo = fs.readFileSync(path, 'utf8');

// 1. SUBSTITUIÇÃO DO BLOCO DE CANCELAMENTO (Garante persistência do +1 no Supabase)
const trechoCancelamentoAntigo = conteudo.match(/async function executarCancelamentoBanco\(\)[\s\S]*?\}\s*\}\s*\}/)[0];

const trechoCancelamentoNovo = `async function executarCancelamentoBanco() {
    if (!aulaSelecionadaId) return;
    try {
      console.log("⏳ SALVANDO CANCELAMENTO NO SUPABASE ID:", aulaSelecionadaId);
      
      // Localiza a aula para saber o tipo dela antes de devolver o crédito
      const aulaParaCancelar = aulas.find(a => a.id === aulaSelecionadaId);
      const tipoBanco = aulaParaCancelar?.tipo === "reposicao" ? "reposicao" : "regular";

      const { error } = await supabase
        .from("user_agenda_appointments")
        .update({ canceled_at: new Date().toISOString() })
        .eq("id", aulaSelecionadaId);

      if (error) throw error;
      console.log("✅ Cancelamento persistido com sucesso!");

      // Sincroniza e Devolve o crédito direto no Supabase
      const campoCredito = tipoBanco === "reposicao" ? "replacement_credits" : "class_credits_available";
      const valorAtual = tipoBanco === "reposicao" ? planoAluno.creditosReposicao : planoAluno.creditosAulas;
      const novoValor = valorAtual + 1;

      await supabase.from("user_subscriptions")
        .update({ [campoCredito]: novoValor })
        .eq("user_id", userId);

      // Atualiza o estado visual no Frontend
      setPlanoAluno(prev => ({
        ...prev,
        creditosAulas: campoCredito === "class_credits_available" ? novoValor : prev.creditosAulas,
        creditosReposicao: campoCredito === "replacement_credits" ? novoValor : prev.creditosReposicao
      }));

      setAulas(prev => prev.map(a => a.id === aulaSelecionadaId ? { ...a, status: "cancelada" } : a));
    } catch (err) {
      console.error("❌ Erro ao salvar cancelamento:", err.message);
      alert("Erro ao salvar o cancelamento: " + err.message);
    } finally {
      setMensagemCancelamento(null);
      setTipoErroCancelamento(null);
    }
  }`;

conteudo = conteudo.replace(trechoCancelamentoAntigo, trechoCancelamentoNovo);

// 2. SUBSTITUIÇÃO DO BLOCO DE AGENDAMENTO (Garante retorno do UUID real)
const trechoAgendamentoAntigo = conteudo.match(/async function executarAgendamento\(\)[\s\S]*?\}\s*\}\s*\}\s*\}\s*\);\s*\}\s*\}/)[0];

const trechoAgendamentoNovo = `async function executarAgendamento() {
    setMensagem(null);
    
    const tipoOriginal = (modoAgendamento === "reposicion" || modoAgendamento === "reposicao" || tipoAula === "reposicao") ? "reposicao" : "regular";
    
    const nova: Aula = { 
      id: String(Date.now()), 
      data: selectedDate, 
      horario: selectedHorario, 
      tipo: tipoOriginal, 
      status: "agendada" 
    };

    const tipoBanco = tipoOriginal === "reposicao" ? "reposicao" : "regular";
    const timestampCombinado = \`\${selectedDate}T\${selectedHorario}:00.000Z\`;

    let idFinal = userId;
    if (!idFinal) {
      const { data: sessionData } = await supabase.auth.getSession();
      idFinal = sessionData?.session?.user?.id || "";
    }

    supabase.from("user_agenda_appointments").insert([
      {
        user_id: idFinal || null,
        appointment_date: timestampCombinado,
        appointment_type: tipoBanco,
        status: "agendada"
      }
    ]).select("id").single().then(({ data, error }) => {
      if (error) {
        console.error("❌ Erro ao gravar no Supabase:", error.message);
        alert("Erro ao salvar no banco: " + error.message);
      } else {
        console.log("✅ Agendamento salvo com sucesso no Supabase!");
        
        if (data && data.id) {
          nova.id = data.id; // Vincula o UUID real retornado do banco
        }

        const campoCredito = tipoBanco === "reposicao" ? "replacement_credits" : "class_credits_available";
        const valorAtual = tipoBanco === "reposicao" ? planoAluno.creditosReposicao : planoAluno.creditosAulas;
        const novoValor = Math.max(0, valorAtual - 1);

        supabase.from("user_subscriptions")
          .update({ [campoCredito]: novoValor })
          .eq("user_id", idFinal)
          .then(({ error: updateErr }) => {
            if (updateErr) {
              console.error("❌ Erro ao atualizar créditos no Supabase:", updateErr.message);
            } else {
              console.log("🪙 Crédito gravado e reduzido diretamente no Supabase!");
              setPlanoAluno(prev => ({
                ...prev,
                creditosAulas: campoCredito === "class_credits_available" ? novoValor : prev.creditosAulas,
                creditosReposicao: campoCredito === "replacement_credits" ? novoValor : prev.creditosReposicao
              }));
            }
          });

        setAulas(prev => [nova, ...prev]);
        setMensagem({ tipo: "sucesso", texto: t.successMsg });
        setActiveTab("lista");
      }
    });
  }`;

conteudo = conteudo.replace(trechoAgendamentoAntigo, trechoAgendamentoNovo);

fs.writeFileSync(path, conteudo, 'utf8');
console.log('✅ INTEGRAÇÃO COMPLETA SUPABASE APLICADA COM SUCESSO!');
