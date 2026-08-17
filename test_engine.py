from haas_slide_engine import HaasPresentationEngine

payload = {
    "slide_1": {"titulo": "Título da Aula de Teste", "subtitulo": "Boas-vindas ao Haas Engine"},
    "slide_3": {"titulo": "Warm-up", "subtitulo": "Fala Ativa", "conteudo": "Qual é o seu objetivo de aprendizado hoje?"},
    "slide_10": {
        "titulo": "Prática Guiada",
        "subtitulo": "Exercícios Nivelados",
        "conteudo": [
            {"texto": "1. Complete com o verbo correto...", "nivel": "Inicial"},
            {"texto": "2. Reescreva a frase no passado...", "nivel": "Intermediário"}
        ]
    },
    "slide_16": {
        "titulo": "Atividade de Escrita",
        "conteudo": "Escreva 3 frases usando o vocabulário de hoje.",
        "nota_pedagogica": "Fixação de estrutura para reduzir tradução mental."
    }
}

engine = HaasPresentationEngine()
engine.build_presentation(payload, "/var/www/haas-frontend-desk-mobile-oficial/public/temp-miniaturas/template-haas-modelo.pptx")
