import urllib.request
import json
import os

SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co"

NOVOS_CODES = {
    "e9b8fc2c-5d21-45d8-a86e-a21fc1bb4b79": "VOCALES",
    "596fdbc8-0267-4143-a385-19e56d0a07f1": "SALUDOS",
    "4c1e1f8b-205e-4981-bf72-9fb7f062df36": "PRESENTARSE",
    "a4b95abc-5cc5-4dab-aee2-303c511c13ae": "IDENTIDAD",
    "b2eaef02-1740-4575-92d9-47a7a7419a10": "SONIDO R/J",
    "424d49d3-9bbe-4f0c-84a3-732454d85b66": "VERBO TO BE",
    "dda5ea8f-6c4d-47ed-b662-328f3bc7d293": "SOBREVIVIR",
    "16c9869d-e1e4-465b-9392-7dcf8b0e0414": "OCUPACIÓN",
    "84a21e19-5490-43ff-9659-fb5961266e72": "VOCABULARIO",
    "936264d8-851b-449a-a600-c4896a02e22f": "NASALES",
    "fea2e7d8-7fcb-476e-81cf-e233abeb040e": "SUFIJOS",
    "7b5c4689-bd45-47ab-a6dd-d75d9298c9f5": "DIPTONGOS",
    "9e80fb25-54a7-4ac5-9e62-60575c2ed5f8": "SONIDO X",
    "e90e6a17-a962-474d-a249-590d4ec8015e": "MI FAMILIA",
    "d81fb90d-8f7c-4f28-a38c-c802b0c3a988": "MI CASA",
    "77b9025b-8e8a-4089-910f-376add26f6c2": "POSESIÓN",
    "08103e66-8769-4538-b86e-2a695631d1fe": "COLORES",
    "b4a4526f-5ed8-4836-b1c1-8f18a5851b49": "UBICACIÓN",
    "b7346284-515b-468e-ab15-c4f77a63c6f1": "PRECIOS",
    "d854f7d6-327f-4b85-aa49-f338250777c8": "LA HORA",
    "b1a77a49-2d95-48bb-abc8-eec86ad04584": "RESTAURANTE",
    "8bce7c45-c301-4f2d-a8ce-7181b875a96f": "GUSTOS",
    "f0937543-5c29-47f3-b53e-029e86772632": "TRANSPORTE",
    "1bdcf5f2-9fe8-4ef9-9ca4-f8184763bdec": "LUGAR",
    "97718702-d890-4c3c-8a36-9ef09d4f067a": "VERBO IR",
    "1febb88d-c1d2-4bf6-8150-7a2fd085af51": "MI RUTINA",
    "2f92f4b7-8e0b-4ec7-a89a-bbb9bb2c5c11": "CUIDADO",
    "905d06de-91da-4ce3-a752-3a05bbc30b5a": "TIEMPO LIBRE",
    "924fc581-eb6e-4714-982d-079238ae9280": "GÉNERO",
    "bd7f66ec-eadc-40d2-a26d-47879ea9e831": "EXCEPCIONES",
    "49f8751d-36e0-4c29-b1a0-a452c6e9aaf2": "FALSO AMIGO",
    "cebe93ab-0053-45cf-a7b5-9a8d7e04a750": "IMPERATIVO",
    "33feade1-361c-4da1-aa0e-dbe4efcd8ef1": "PASADO -AR",
    "5fc79f22-d779-4f6e-80be-05cd8de2c499": "PASADO -ER",
    "913f8ae7-2398-4eb2-873c-e3ee001cd9b3": "IRREGULARES",
    "6c3442c8-60de-41c5-b876-085bf6046831": "PROFESIONES",
    "ef8ca2a6-e869-4b4d-a9d1-0710603c9e22": "EXPERIENCIAS",
    "69d068d1-3b50-4912-a22e-4b7370f2eaf9": "GERUNDIO",
    "70975513-8f2a-4ceb-b96f-c9c8bef7041c": "TECNOLOGÍA",
    "2f01b353-54c6-4d2e-ba05-133a9263c8f3": "REDES",
    "4cfbf10e-d33c-4c49-8aac-3a2160b1b85e": "DESCRIBIR",
    "6d2324fe-0e80-468a-8fae-325213d63f62": "CHAT DIGITAL",
    "0360b08b-7614-4cc4-9b98-a274503b7eda": "EL CUERPO",
    "4db5d235-0dcd-498c-800d-acd9a490e525": "SÍNTOMAS",
    "c8257161-8675-4bf0-8924-7f0ba7627937": "EMOCIONES",
    "b212bad3-1b56-4313-ba2d-d2b351e72a9f": "FARMACIA",
    "869c8017-0234-4297-8503-934e8555e04c": "CONSULTORIO",
    "c0b1e42f-54af-4990-91aa-bd76728fc0f0": "FUTURO",
    "b9229908-a686-4cc4-9925-4a38c6c2fd17": "FIN SEMANA",
    "64465fdc-8c0c-4d5d-993d-bacb9a631370": "VACACIONES",
    "f769eab5-05fb-4333-bb73-d46c03346a9b": "PROYECTOS",
    "640c8db1-48b6-4b94-9d09-37561db8b6fd": "EL FUTURO",
    "e9328bc1-7158-4fb7-8178-3a0342184b21": "MI INFANCIA",
    "4b306a27-272e-4bdb-9842-34055f8936fa": "SOCIEDAD",
    "f36b81a4-6b32-4198-b7f1-e43e11654fa4": "IMPERFECTO",
    "b15b6fe6-9f35-4955-b1f6-398a97768edd": "SECUENCIA",
    "54d7c1b6-6e4a-4136-9aa6-7c877b24b8dc": "HISTORIAS",
    "267ab4ef-6c25-4f05-aadf-18abe9b30677": "DESEOS",
    "2c1f6da3-b79c-47a5-8aa4-5bd412c0860b": "ÓRDENES",
    "fa61e091-acc9-4ddb-bee9-07d976100828": "INCERTEZA",
    "544b2d27-8aec-42cb-ab3b-849cdd0d4a6d": "HIPÓTESIS",
    "6cc7f852-f8d4-4f99-a1d4-551fca1a682f": "DEBATIR",
    "40c519b8-c9dc-475d-b6bb-59214e338997": "PETICIONES",
    "a14af4ff-ef5e-4648-882b-94c7e6055a7d": "CONDICIONAL",
    "c4e2bc7d-848a-466d-8776-f07833e0d8f2": "SUBJUNTIVO",
    "d5dd3fd4-0077-4a97-8437-08766b0d46f2": "SI TUVIERA",
    "9c30c470-62a1-4ac2-b90b-09b85aa40fff": "ARREPENTIRSE",
    "33c77a5e-ddb2-467a-9cfa-ceea67ed9571": "TRABAJO",
    "2c394d3e-74b7-45e3-8483-5e4c9470242d": "CONCESIÓN",
    "abd3b885-73de-43a0-9e88-75f66b03721b": "CAUSAS",
    "c46b8da3-2e66-4995-abe0-a5b0ebe3235d": "CONTRASTE",
    "d1b8e837-634f-4e0c-b6e7-4edeed5c921b": "REDACCIÓN",
    "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0": "ACENTOS",
    "be5d620c-a45c-4af1-90bb-de5c144d989e": "JERGAS",
    "e2cd91b9-88c8-49a7-95db-1bfbd4dc7ca7": "MODISMOS",
    "1a946611-3865-4d7d-aeb9-991635efe527": "IRONÍA",
    "8a24c547-4e60-4e44-a396-31082b7d7832": "CORTESÍA",
    "9484c6a0-dfc2-49cf-b0f8-9ebfdf1ea318": "VOCAL EXTRA",
    "9d68406e-4e65-437d-98df-943111fcd54c": "NOTICIAS",
    "cc4a4be2-e339-47f6-a420-bf8b12ccc203": "MÁS DEBATE",
    "f3758cbf-d9a0-4eca-8de7-f7d11fcbc984": "AUNQUE",
    "1ae15180-3fc5-4237-93da-328676c90c3a": "CIUDADANÍA",
    "48572bd4-4583-4661-a109-ae87862f3113": "TU OPINIÓN",
    "58c9c074-b30f-419f-a9d7-a9fd94e6cd4c": "DISCURSO",
    "211cd950-4365-4b23-bd78-5146c8012a82": "RELATAR",
    "0b2543c2-7c93-44ed-a609-2b575e50ac06": "VOZ PASIVA",
    "53cac74c-9ab4-4afa-8c0f-b4038ce58d54": "VOZ FORMAL",
    "05530541-e06a-4bfa-91b1-6b07fd160752": "CRÓNICAS",
    "e475e25d-3b33-4d49-8bb4-800f4c573061": "INICIO/FIN",
    "2c2bd5eb-8e11-4181-9251-cd0247207e05": "HÁBITOS",
    "fdf744cb-12e5-4de7-9443-0eeef6f093d0": "SOSTENIBLE",
    "412d3727-1ac6-4860-8ff6-a395d002ba1f": "ESTILO VIDA",
    "ef9e77f3-fc0e-43dc-8cec-26b668be2688": "REPASO FINAL",
    "0c1ef173-852a-4239-8288-da15ab0dcca2": "PRÓCLISIS",
    "a8a2ab1c-c132-45e5-b1fb-02baca8aafbe": "ÉNCLISIS",
    "25ab88b0-fd87-4cba-bc06-4fd0cb2d94fa": "MESÓCLISIS",
    "159925f4-22c6-40e3-bc67-d0490bd0687f": "LOCUCIONES",
    "d3852405-dbcc-47ae-82bf-5f69fbee8377": "PRONOMBRES",
    "12f44728-591d-4cf1-8691-d6bba9d0e00a": "USA CRASIS",
    "82761c85-769f-49d1-a9e7-d8abd6242093": "SIN CRASIS",
    "ee54860c-d736-4fc8-8f8a-88504c69bc79": "CRASIS LIBRE",
    "34596b43-bdd1-45e5-83a6-3ac16552e15e": "REGENCIA",
    "ec0cd288-703b-49e1-846b-b07d29c6a375": "MÁS REGENCIA",
    "544ddbf7-2614-46ea-8c86-ded99f4b3c92": "CRÓNICA",
    "65b2511d-1775-4fed-8ef0-c23976fc80d3": "NOSTALGIA",
    "e8f0fe7e-b4ec-481b-896e-4ec36298a14e": "AMBIGÜEDAD",
    "4bfa07a2-b03d-49ce-b736-8b4fda3790dd": "REGISTRO",
    "347c1497-dd74-47da-a790-de6421b4718b": "MEMES",
    "5ddae091-05dd-40a8-ade0-ed40254e48be": "EDITORIALES",
    "7e086974-22fa-4db1-9485-caa68b6d8c5f": "RITMO",
    "5f5b880e-91a3-4335-bf6f-dab75ec38524": "CONCORDANCIA",
    "5bf7c69a-c232-4ff8-87ec-1732ee197257": "COLECTIVOS",
    "33e9c659-2714-4e7c-b617-f646d50123ca": "ARGUMENTAR",
}


def patch(unit_id, key, novo_code):
    body = json.dumps({"success_code": novo_code}).encode("utf-8")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/units?id=eq.{unit_id}",
        data=body,
        method="PATCH",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


if __name__ == "__main__":
    KEY = os.environ.get("SUPABASE_KEY")
    if not KEY:
        with open("/var/www/haas-frontend-desk-mobile-oficial/.env") as f:
            for linha in f:
                if linha.startswith("SUPABASE_SERVICE_ROLE_KEY="):
                    KEY = linha.strip().split("=", 1)[1]
                    break

    total = len(NOVOS_CODES)
    ok, falhas = 0, []
    for i, (unit_id, novo_code) in enumerate(NOVOS_CODES.items(), 1):
        try:
            patch(unit_id, KEY, novo_code)
            print(f"[{i}/{total}] {novo_code}  OK")
            ok += 1
        except Exception as e:
            print(f"[{i}/{total}] {novo_code}  ERRO: {e}")
            falhas.append(unit_id)

    print(f"\nConcluído: {ok}/{total} atualizados.")
    if falhas:
        print(f"Falharam {len(falhas)}: {falhas}")
