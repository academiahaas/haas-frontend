import json
import urllib.request

DEEPSEEK_KEY = "sk-e426fa20f2c64907bb550d7eccf1261f"

GLOSSARIO_OFICIAL = """
VOGAIS E CONSOANTES FINAIS (aplicar SOMENTE na última sílaba, nunca no meio)
- O/OS final átono → U/US (carro→carru, amigos→amigus)
- E/ES final átono → I/IS (come→comi, bebes→bebis)
- L final de sílaba/palavra → U (Brasil→Brasiu, alto→autu)
- EM final → EiM (também→tambeim, viagem→viageim)
PALATIZAÇÕES (só quando I/E está na última sílaba)
- T + I/E final → CHI (noite→noichi, gente→genchi)
- D + I/E final → YI, SEMPRE "YI", NUNCA "DJI" (dia→yia, cidade→cidadyi, onde→onyi)
R e J
- R inicial ou RR → J gutural (rio→jiu, carro→caju)
- R simples no meio da palavra (entre vogais) → r fraco, igual espanhol (Maria, caro — sem mudar)
- J → Y (janela→yanela)
- G antes de E/I, SÓ no início da palavra → Y (gente→yenchi). NÃO aplicar no meio da palavra (agenda fica agenda, não muda).
OUTRAS CONSOANTES
- CH → SH (chuva→shuva, chave→shave)
- Ç → SS (praça→prassa, moço→mossu)
- NH → Ñ (manhã→mañã)
- LH → LI rápido (filho→filiu)
NASAIS
- ÃO → ÃU (pão→pãu, coração→corasãu)
- ÃE → ÃI (mãe→mãi)
A LETRA X (quatro sons, dependendo do contexto)
- Início/após ditongo nasal → SH | Antes de consoante → S | Entre vogais/ex- → Z | Técnicas/estrangeiras → KS
EPÊNTESE
- PN→PIN | PS→PIS | PT→PIT | TM→TIM | BS→BIS | DV→DIV | GN→GUIN | BJ→BIJ
"""

REVISOR_PROMPT = f"""Você é o revisor de qualidade do conteúdo educacional da Haas Language. Você recebe um conteúdo já gerado (lição escrita ou roteiro de vídeo) e verifica se ele segue TODAS as regras fonéticas abaixo, sem nenhum erro, invenção ou inconsistência.

GLOSSÁRIO FONÉTICO OFICIAL (única fonte de verdade):
{GLOSSARIO_OFICIAL}

ATENÇÃO CRÍTICA DE ESCOPO: só verifique a fonética em trechos que são EXPLICITAMENTE exemplos de pronúncia (padrões tipo "'palavra' vira 'transformação'", ou pronúncia entre parênteses depois de uma frase). Texto narrativo normal (introdução, explicações gerais, frases de prática pra simplesmente ler em português normal) NUNCA deve ser alterado foneticamente — são pra ficar com a grafia padrão do português, sem nenhuma mudança. Se você não tem 100% de certeza que um trecho é um exemplo de pronúncia explícito, NÃO sugira mudança nele.

TAMBÉM verifique (só dentro dos exemplos explícitos de pronúncia):
- Nenhuma transformação fonética inventada (que não está no glossário acima)
- Nenhuma regra aplicada em posição errada (Ex: regra de final de palavra sendo usada no meio da palavra)
- Nenhuma frase confusa, incompleta, "pensando em voz alta" ou pendurada (tipo terminar em "..." sem concluir)
- Nenhum erro óbvio de digitação
- Consistência entre partes diferentes do mesmo conteúdo (se menciona a MESMA transformação fonética de exemplo em dois lugares, ela deve ser igual nos dois)

Antes de sugerir qualquer correção, pergunte-se: "esse trecho É mesmo um exemplo explícito de pronúncia, ou é só texto normal mencionando uma palavra?" Só corrija no primeiro caso.

NÃO sugira mudança em nomes de nível, número de unidade/módulo, títulos ou objetivos pedagógicos — esses são fixos e não fazem parte do que você está revisando.

Retorne APENAS JSON:
- Se estiver tudo certo: {{"aprovado": true}}
- Se achar problema: {{"aprovado": false, "correcoes": [{{"trecho_errado": "cópia EXATA do texto com problema", "trecho_certo": "o texto corrigido"}}]}}

O "trecho_errado" precisa ser uma cópia EXATA (caractere por caractere) de um pedaço do conteúdo original, pra permitir substituição direta via busca-e-troca.

IMPORTANTE: mantenha o "trecho_errado" o MAIS CURTO possível — de preferência só a palavra ou expressão específica com problema (Ex: "ajenda", não a frase inteira ao redor). Trechos curtos têm muito menos chance de erro de cópia. Só inclua mais contexto ao redor se a palavra sozinha não for única o suficiente no texto (aparecer mais de uma vez com significados diferentes)."""


def deepseek(sistema, usuario):
    payload = json.dumps({
        "model": "deepseek-v4-flash",
        "messages": [{"role": "system", "content": sistema}, {"role": "user", "content": usuario}],
        "response_format": {"type": "json_object"},
        "max_tokens": 4000,
        "thinking": {"type": "disabled"},
    }).encode("utf-8")
    req = urllib.request.Request("https://api.deepseek.com/chat/completions", data=payload, headers={"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=180) as r:
        resp = json.loads(r.read().decode("utf-8"))
    return json.loads(resp["choices"][0]["message"]["content"])


def revisar(conteudo_texto):
    """Retorna {'aprovado': bool, 'correcoes': [...]}"""
    return deepseek(REVISOR_PROMPT, conteudo_texto)


def aplicar_correcoes(texto, correcoes):
    """Aplica correções pontuais via busca-e-troca. Retorna (texto_corrigido, quantas_aplicadas, quais_falharam)"""
    aplicadas = 0
    falharam = []
    for c in correcoes:
        if c["trecho_errado"] in texto:
            texto = texto.replace(c["trecho_errado"], c["trecho_certo"])
            aplicadas += 1
        else:
            falharam.append(c["trecho_errado"])
    return texto, aplicadas, falharam


def revisar_e_corrigir(texto, max_passadas=1):
    """Roda o ciclo completo: revisa, corrige, revisa de novo pra confirmar. Retorna o texto final."""
    for passada in range(max_passadas):
        resultado = revisar(texto)
        if resultado.get("aprovado"):
            print(f"  [Revisão passada {passada+1}] Aprovado, sem correções necessárias.")
            return texto
        correcoes = resultado.get("correcoes", [])
        print(f"  [Revisão passada {passada+1}] {len(correcoes)} problema(s) encontrado(s):")
        for c in correcoes:
            print(f"    - '{c['trecho_errado']}' -> '{c['trecho_certo']}'")
        texto, aplicadas, falharam = aplicar_correcoes(texto, correcoes)
        print(f"  {aplicadas}/{len(correcoes)} correções aplicadas.")
        if falharam:
            print(f"  AVISO: {len(falharam)} correção(ões) não encontraram o trecho exato pra substituir: {falharam}")
    return texto
