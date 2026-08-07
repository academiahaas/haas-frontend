const fs = require('fs');
const filePath = './src/app/portal-aluno/components/PortalMobile.tsx';

let fileContent = fs.readFileSync(filePath, 'utf8');

if (!fileContent.includes('REGRA_GRUPO_LIMIT_8')) {
  const targetCode = 'const diasFeriadosDoMes = feriadosColombia2026[mesAgendamento] || [];';
  const newLogic = `// REGRA_GRUPO_LIMIT_8: Trava de 8 alunos para o plano group
                      const isPlanoGrupo = String(perfilAluno?.tipo_plano || '').toLowerCase().includes('group') || String(tipoPlano || '').toLowerCase().includes('group');
                      const inscritosNoHorario = (meusAgendamentos || []).filter((a) => a.horario === horarioSelecionado && a.status !== 'CANCELADO').length;
                      if (isPlanoGrupo && inscritosNoHorario >= 8) {
                        alert(idiomaSelecionado === "PT" ? "Horário Esgotado! Turma de grupo atingiu o limite de 8 alunos." : "Time Slot Full! Group class reached the 8-student limit.");
                        return;
                      }
                      
                      ` + targetCode;
  
  fileContent = fileContent.replace(targetCode, newLogic);
  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log('✅ Trava de 8 alunos para o plano GROUP inserida com sucesso!');
} else {
  console.log('ℹ️ A regra para o plano GROUP já está presente no código.');
}
