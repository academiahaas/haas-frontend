import os
from supabase import create_client, Client
from motor_voz import gerar_voz_exercicio

# Insira aqui as credenciais que você já usa no resto do backend
SUPABASE_URL = "SUA_URL_DO_SUPABASE"
SUPABASE_KEY = "SUA_CHAVE_ANON_OU_SERVICE_ROLE"
TABELA_EXERCICIOS = "NOME_DA_SUA_TABELA"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def vincular_audio_supabase():
    # Puxa os dados atuais para processamento em lote de A a Z
    resposta = supabase.table(TABELA_EXERCICIOS).select("id, texto").execute()
    exercicios = resposta.data

    if not exercicios:
        print("Nenhum dado retornado da tabela.")
        return

    for ex in exercicios:
        id_exercicio = ex["id"]
        texto_exercicio = ex["texto"]
        nome_arquivo = f"exercicio_{id_exercicio}.mp3"
        
        # Gera o arquivo físico na pasta pública do front-end
        link_audio_real = gerar_voz_exercicio(texto_exercicio, nome_arquivo)
        
        if link_audio_real:
            # Atualiza o ponteiro do áudio na tabela correspondente
            supabase.table(TABELA_EXERCICIOS).update({"audio_url": link_audio_real}).eq("id", id_exercicio).execute()
            print(f"✓ ID {id_exercicio} atualizado no Supabase.")

if __name__ == "__main__":
    vincular_audio_supabase()
