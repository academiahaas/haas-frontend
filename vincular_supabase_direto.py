import os
import requests
from motor_voz import gerar_voz_exercicio

# Configurações do seu Supabase
SUPABASE_URL = "SUA_URL_DO_SUPABASE"  # Ex: https://xyz.supabase.co
SUPABASE_KEY = "SUA_CHAVE_ANON_OU_SERVICE_ROLE"
TABELA_EXERCICIOS = "NOME_DA_SUA_TABELA"

# Headers padrão para falar direto com a API REST do Supabase
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def vincular_audio_direto():
    url_tabela = f"{SUPABASE_URL}/rest/v1/{TABELA_EXERCICIOS}"
    
    print("→ Buscando dados diretamente via API REST do Supabase...")
    try:
        # Puxa apenas as colunas necessárias
        response = requests.get(f"{url_tabela}?select=id,texto", headers=headers)
        
        if response.status_code != 200:
            print(f"❌ Erro ao buscar dados: {response.status_code} - {response.text}")
            return
            
        exercicios = response.json()
        if not exercicios:
            print("Nenhum dado retornado da tabela.")
            return

        print(f"✓ Encontrados {len(exercicios)} exercícios para processar.\n")

        for ex in exercicios:
            id_exercicio = ex["id"]
            texto_exercicio = ex["texto"]
            nome_arquivo = f"exercicio_{id_exercicio}.mp3"
            
            # Gera o arquivo físico na pasta pública do front-end (/var/www/haas-frontend)
            link_audio_real = gerar_voz_exercicio(texto_exercicio, nome_arquivo)
            
            if link_audio_real:
                # Atualiza a coluna audio_url via PATCH direto no ID correspondente
                url_update = f"{url_tabela}?id=eq.{id_exercicio}"
                update_data = {"audio_url": link_audio_real}
                
                up_response = requests.patch(url_update, headers=headers, json=update_data)
                
                if up_response.status_code in [200, 201, 204]:
                    print(f"✓ ID {id_exercicio} atualizado com sucesso no Supabase.")
                else:
                    print(f"⚠️ Erro ao atualizar ID {id_exercicio}: {up_response.status_code}")
            else:
                print(f"❌ Falha ao gerar áudio para o ID {id_exercicio}")

    except Exception as e:
        print(f"❌ Ocorreu um erro na integração: {e}")

if __name__ == "__main__":
    vincular_audio_direto()
