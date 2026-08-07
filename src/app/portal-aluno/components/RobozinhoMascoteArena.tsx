import React from "react";
import { Bot } from "lucide-react";

interface RobozinhoMascoteArenaProps {
  comboCount?: number;
  onClick?: () => void;
}

export function RobozinhoIconeAzul({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center justify-center p-2 rounded-full border border-sky-500/30 bg-sky-950/20 text-sky-400 hover:text-sky-300 hover:border-sky-400 hover:bg-sky-900/30 transition-all shrink-0 cursor-pointer shadow-[0_0_10px_rgba(56,189,248,0.15)] focus:outline-none"
      title="Assistente IA"
    >
      <Bot className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 stroke-[2]" />
    </button>
  );
}

export default function RobozinhoMascoteArena({ onClick }: RobozinhoMascoteArenaProps) {
  return <RobozinhoIconeAzul onClick={onClick} />;
}
