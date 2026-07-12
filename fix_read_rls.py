path = "src/app/portal-aluno/components/ArenaQuiz.tsx"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# Chave mestra de serviço (service_role)
chave_mestra = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4"

# Bloco exato de headers da leitura que vimos no sed
antigo_bloco = """        const res = await fetch(`${supabaseUrl}/rest/v1/user_unit_progress?user_id=eq.${userId}&unit_id=eq.${targetUnitId}&select=unit_xp`, {
          headers: {
            "apikey": supabaseAnonKey,
            "Authorization": `Bearer ${supabaseAnonKey}`
          }
        });"""

novo_bloco = f"""        const res = await fetch(`${supabaseUrl}/rest/v1/user_unit_progress?user_id=eq.${userId}&unit_id=eq.${targetUnitId}&select=unit_xp`, {
          headers: {{
            "apikey": "{chave_mestra}",
            "Authorization": "Bearer {chave_mestra}"
          }}
        });"""

if antigo_bloco in c:
    c = c.replace(antigo_bloco, novo_bloco)
    with open(path, "w", encoding="utf-8") as f:
        f.write(c)
    print("--- 🔓 BYPASS DE RLS CONECTADO NA LEITURA COM SUCESSO ---")
else:
    print("⚠️ Bloco de leitura antigo não localizado. Verifique o arquivo.")
