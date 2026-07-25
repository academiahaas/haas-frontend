"use client";

import React from "react";

// Importação dos 13 Miolos de Exercícios Oficiais do Mobile
import DitadoLacunas from "./exercise-types/DitadoLacunas";
import MioloBlitzChallenge from "./exercise-types/MioloBlitzChallenge";
import MioloBlocos from "./exercise-types/MioloBlocos";
import MioloCacaErro from "./exercise-types/MioloCacaErro";
import MioloLeituraRapida from "./exercise-types/MioloLeituraRapida";
import MioloMultiplaEscolha from "./exercise-types/MioloMultiplaEscolha";
import MioloOrdenacao from "./exercise-types/MioloOrdenacao";
import MioloReordenacaoParagrafos from "./exercise-types/MioloReordenacaoParagrafos";
import MioloRoleplay from "./exercise-types/MioloRoleplay";
import MioloShadowing from "./exercise-types/MioloShadowing";
import MioloSpellingBee from "./exercise-types/MioloSpellingBee";
import MioloTraducaoInversa from "./exercise-types/MioloTraducaoInversa";
import MioloVelocidadeProgressiva from "./exercise-types/MioloVelocidadeProgressiva";

export type TipoMioloExercico = 
  | "DITADO_LACUNAS"
  | "BLITZ_CHALLENGE"
  | "BLOCOS"
  | "CACA_ERRO"
  | "LEITURA_RAPIDA"
  | "MULTIPLA_ESCOLHA"
  | "ORDENACAO"
  | "REORDENACAO_PARAGRAFOS"
  | "ROLEPLAY"
  | "SHADOWING"
  | "SPELLING_BEE"
  | "TRADUCAO_INVERSA"
  | "VELOCIDADE_PROGRESSIVA";

interface RenderizadorMiolosProps {
  tipo: TipoMioloExercico | string;
  status?: "IDLE" | "CORRECT" | "WRONG";
  unidadeAtiva?: string;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  onSelectionChange?: (hasItems: boolean) => void;
}

export default function RenderizadorMiolosArena({
  tipo,
  status = "IDLE",
  unidadeAtiva,
  onValidateResult,
  onSelectionChange
}: RenderizadorMiolosProps) {

  const tipoUpper = (tipo || "").toString().toUpperCase();
  const commonProps = { status, unidadeAtiva, onValidateResult, onSelectionChange };

  switch (tipoUpper) {
    case "DITADO_LACUNAS":
      return <DitadoLacunas {...commonProps} />;

    case "BLITZ_CHALLENGE":
      return <MioloBlitzChallenge {...commonProps} />;

    case "BLOCOS":
      return <MioloBlocos {...commonProps} />;

    case "CACA_ERRO":
      return <MioloCacaErro {...commonProps} />;

    case "LEITURA_RAPIDA":
      return <MioloLeituraRapida {...commonProps} />;

    case "MULTIPLA_ESCOLHA":
      return <MioloMultiplaEscolha {...commonProps} />;

    case "ORDENACAO":
      return <MioloOrdenacao {...commonProps} />;

    case "REORDENACAO_PARAGRAFOS":
      return <MioloReordenacaoParagrafos {...commonProps} />;

    case "ROLEPLAY":
      return <MioloRoleplay {...commonProps} />;

    case "SHADOWING":
      return <MioloShadowing {...commonProps} />;

    case "SPELLING_BEE":
      return <MioloSpellingBee {...commonProps} />;

    case "TRADUCAO_INVERSA":
      return <MioloTraducaoInversa {...commonProps} />;

    case "VELOCIDADE_PROGRESSIVA":
      return <MioloVelocidadeProgressiva {...commonProps} />;

    default:
      return <MioloMultiplaEscolha {...commonProps} />;
  }
}
