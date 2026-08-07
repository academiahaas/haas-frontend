-- ============================================================================
-- HAAS ACADEMY - SCRIPT DE INSERÇÃO DE DADOS (SUPABASE / POSTGRES)
-- NÍVEL: A2 | MÓDULO 1: O Ontem e as Minhas Histórias
-- TOTAL DE LIÇÕES: 5 UNIDADES (10 HORAS)
-- ============================================================================

INSERT INTO lessons (
    level, 
    module_number, 
    module_title, 
    lesson_number, 
    lesson_title, 
    duration_hours, 
    situational_context, 
    grammatical_focus, 
    portunhol_shield, 
    exercises_pool
) VALUES 
(
    'A2',
    1,
    'O Ontem e as Minhas Histórias',
    1,
    'O que você fez ontem? — Verbos Regulares em -AR',
    2,
    'Relatar ações simples e fatos pontuais concluídos no dia anterior (ontem) ou no último fim de semana.',
    'Introdução ao Pretérito Perfeito Simples focado exclusivamente nos verbos regulares terminados em -AR (falar, comprar, estudar, trabalhar).',
    'Evitar que o aluno confunda a terminação da primeira pessoa (hablé -> falei, e não hablei), limpando a raiz fonética do portunhol.',
    '{"easy": [{"id": "a2_m1_u1_e1", "type": 5, "instruction": "Ordene os blocos para formar a frase correta no passado.", "context": "Você está contando o que comprou ontem.", "scrambled_elements": ["ontem", "um", "carro", "Eu", "comprei"], "correct_answer": "Eu comprei um carro ontem", "explanation": "Em português, o passado dos verbos em -AR na primeira pessoa termina em -ei (comprei, falei, estudei). Não adicione a letra ''a'' como no espanhol."}], "medium": [], "hard": []}'::jsonb
),
(
    'A2',
    1,
    'O Ontem e as Minhas Histórias',
    2,
    'O que aconteceu? — Verbos Regulares em -ER e -IR',
    2,
    'Relatar experiências e eventos pessoais concluídos envolvendo consumo ou locomoção simples (comer, beber, assistir, partir).',
    'Conjugação no Pretérito Perfeito Simples dos verbos regulares terminados em -ER e -IR (comer, vender, abrir, assistir).',
    'Fixar a diferença de pronúncia e escrita nas pessoas do plural (nós comemos no passado, diferenciando do espanhol).',
    '{"easy": [{"id": "a2_m1_u2_e1", "type": 13, "instruction": "Selecione a terminação correta para o verbo no passado.", "context": "Ontem à noite, nós [gap] muito no restaurante.", "gaps": ["comemos"], "options": ["comemos", "comimos", "comemos-nos"], "correct_answer": "comemos", "explanation": "Para nós, os verbos em -ER mantêm a terminação -emos no pretérito perfeito (nós comemos, nós bebemos), diferente do espanhol ''comimos''."}], "medium": [], "hard": []}'::jsonb
),
(
    'A2',
    1,
    'O Ontem e as Minhas Histórias',
    3,
    'O Labirinto dos Passados Irregulares',
    2,
    'Contar para onde foi, o que fez e o que teve que resolver em um dia corrido do passado.',
    'Domínio dos verbos irregulares de altíssima frequência no Pretérito Perfeito Simples: Ir, Ser, Ter e Fazer.',
    'Mostrar como o passado do verbo Ir e Ser são idênticos (Eu fui ao mercado / Eu fui um bom aluno) aproveitando a ponte cognitiva do espanhol.',
    '{"easy": [{"id": "a2_m1_u3_e1", "type": 1, "instruction": "Identifique o significado do verbo ''fui'' na frase abaixo.", "context": "No ano passado, eu fui o diretor da empresa.", "options": ["Verbo Ir (deslocamento)", "Verbo Ser (característica/cargo)"], "correct_answer": "Verbo Ser (característica/cargo)", "explanation": "Assim como no espanhol, a forma ''fui'' serve tanto para o verbo Ir quanto para o verbo Ser. Aqui indica o cargo que a pessoa ocupava."}], "medium": [], "hard": []}'::jsonb
),
(
    'A2',
    1,
    'O Ontem e as Minhas Histórias',
    4,
    'Quem sou eu no mercado? — Profissões e Gênero',
    2,
    'Identificar, nomear e showbiz profissões e ocupações do dia a dia. Falar sobre o que você ou seus familiares faziam ou fazem.',
    'Regras de variação e marcação de gênero aplicadas às profissões.',
    'Exercícios intensivos com as profissões comuns de gênero uniforme (o gari / a gari, o dentista / a dentista), impedindo que o aluno invente palavras inexistentes.',
    '{"easy": [{"id": "a2_m1_u4_e1", "type": 5, "instruction": "Ordene as palavras para definir a profissão da Ana.", "context": "Ana trabalha com tratamento dentário.", "scrambled_elements": ["Ana", "dentista", "é", "excelente", "uma"], "correct_answer": "Ana é uma excelente dentista", "explanation": "A palavra ''dentista'' é de gênero uniforme. Para indicar o feminino, alteramos apenas o artigo ou adjetivo (uma dentista), nunca a palavra em si."}], "medium": [], "hard": []}'::jsonb
),
(
    'A2',
    1,
    'O Ontem e as Minhas Histórias',
    5,
    'Minhas Experiências Concluídas',
    2,
    'Juntar tudo! Criar pequenos relatos integrando o que aprendeu sobre o passado com as profissões (Ex: ''Ontem eu fui ao banco e falei com a gerente'').',
    'Consolidação do Pretérito Perfeito (regulares e irregulares) em frases afirmativas, negativas e interrogativas de nível A2.',
    'Exercícios de ordenação e contexto para dar fluência natural e segurança, eliminando as pausas do portunhol ao misturar tempos verbais.',
    '{"easy": [{"id": "a2_m1_u5_e1", "type": 13, "instruction": "Complete o relato usando os verbos corretos no passado.", "context": "Ontem eu [gap] ao escritório e [gap] o relatório técnico.", "gaps": ["fui", "fiz"], "options": ["fui / fiz", "ia / fize", "fui / fuzi"], "correct_answer": "fui / fiz", "explanation": "Combinamos o verbo irregular ''ir'' (fui) com o irregular ''fazer'' (fiz) para relatar ações perfeitamente concluídas no passado."}], "medium": [], "hard": []}'::jsonb
);
