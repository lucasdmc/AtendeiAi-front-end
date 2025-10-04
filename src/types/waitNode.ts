/**
 * Tipos para o nó Aguardar (Wait/Delay)
 */

export type WaitMode = 'fixed' | 'variable';
export type WaitUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

export interface WaitConfig {
  mode: WaitMode;
  
  // Modo Fixo
  fixedValue?: number;
  fixedUnit?: WaitUnit;
  
  // Modo Variável
  variableName?: string;
  
  // Fluxo se responder antes
  responseFlowEnabled: boolean;
}

export const WAIT_UNIT_LABELS: Record<WaitUnit, string> = {
  seconds: 'Segundos',
  minutes: 'Minutos',
  hours: 'Horas',
  days: 'Dias',
  weeks: 'Semanas',
  months: 'Meses',
};

