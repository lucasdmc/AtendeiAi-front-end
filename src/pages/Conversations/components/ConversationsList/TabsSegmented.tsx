import React from "react";

export type TabKey =
  | "bot"
  | "entrada"
  | "aguardando"
  | "em_atendimento"
  | "finalizadas";

const LABELS: Record<TabKey, string> = {
  bot: "Bot/IA",
  entrada: "Entrada",
  aguardando: "Aguardando",
  em_atendimento: "Em atendimento",
  finalizadas: "Finalizadas",
};

interface TabsSegmentedProps {
  active: TabKey;
  counts: Record<TabKey, number>;
  onChange: (t: TabKey) => void;
  compactCount?: boolean; // default true => 1.2k
}

export const TabsSegmented: React.FC<TabsSegmentedProps> = ({
  active,
  counts,
  onChange,
  compactCount = true,
}) => {
  console.log('🔍 [TabsSegmented] Estado das abas:', {
    active,
    counts,
    finalizadasCount: counts.finalizadas
  });

  const handleTabClick = (tab: TabKey) => {
    console.log('🔍 [TabsSegmented] Clicando na aba:', tab);
    onChange(tab);
  };
  const fmt = (n: number) =>
    compactCount
      ? new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(n)
      : String(n);

  const group =
    "w-full bg-[#EEF3FF] rounded-full p-1 flex flex-nowrap items-center whitespace-nowrap overflow-hidden";

  const base =
    "relative inline-flex items-center gap-1.5 h-7 px-2 rounded-full select-none text-[11px] leading-none transition-colors duration-150";

  const badgeBase =
    "min-w-[1.125rem] h-4 px-1 inline-flex items-center justify-center rounded-full text-[9px] leading-none font-semibold tabular-nums";

  return (
    <div className={group} role="tablist" aria-label="Filtrar conversas">
      {(Object.keys(LABELS) as TabKey[]).map((key) => {
        const isActive = key === active;
        const pill = isActive
          ? `${base} bg-[#3D62F5] text-white font-semibold`
          : `${base} text-[#1F2937] font-medium hover:bg-[#E3EBFF]`;
        const badge = isActive
          ? `${badgeBase} bg-white text-[#3D62F5]`
          : `${badgeBase} bg-white/80 text-[#3D62F5] border border-[#D7E2FF]`;

        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            className={pill}
            onClick={() => handleTabClick(key)}
            type="button"
          >
            <span>{LABELS[key]}</span>
            <span className={badge}>{fmt(counts[key] ?? 0)}</span>
          </button>
        );
      })}
    </div>
  );
};
