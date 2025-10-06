/**
 * Canvas Node: Webhook
 */

import { memo, useState, useCallback, useEffect } from 'react';
import { NodeProps, Position, useStore } from '@xyflow/react';
import { Code, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NodeConnector } from './parts/NodeConnector';
import { NodeActionsMenu } from './parts/NodeActionsMenu';
import { NodeInfoDialog } from './parts/NodeInfoDialog';
import { NODE_TOKENS } from './styles';
import { WebhookConfig } from '@/types/webhookNode';

export interface WebhookData {
  value?: WebhookConfig;
  onChange?: (value: WebhookConfig) => void;
  onOpenDrawer?: () => void;
}

export const WebhookNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = (data || {}) as WebhookData;
  
  // Garantir que sempre temos um valor padrão
  const defaultValue: WebhookConfig = {
    endpoint: '',
    method: 'POST',
    urlParameters: [],
    headers: [],
    body: '',
    returnMappings: [],
  };
  
  const [value, setValue] = useState<WebhookConfig>(
    nodeData.value || defaultValue
  );
  
  const [showInfo, setShowInfo] = useState(false);

  // Sincronizar com mudanças externas (quando o drawer salvar)
  useEffect(() => {
    if (nodeData.value) {
      setValue(nodeData.value);
    }
  }, [nodeData.value]);

  // Verificar conexões
  const edges = useStore((store) => store.edges);
  const isConnectedIn = edges.some((edge) => edge.target === id);
  const isConnectedSuccess = edges.some((edge) => edge.source === id && edge.sourceHandle === 'out:success');
  const isConnectedError = edges.some((edge) => edge.source === id && edge.sourceHandle === 'out:error');

  // Validação
  const isConfigured = value.endpoint?.trim().length > 0;


  const handleOpenDrawer = useCallback(() => {
    if (nodeData.onOpenDrawer) {
      nodeData.onOpenDrawer();
    }
  }, [nodeData]);

  const handleDuplicate = useCallback(() => {
    console.log(`[WebhookNode] Duplicate node: ${id}`);
  }, [id]);

  const handleDelete = useCallback(() => {
    console.log(`[WebhookNode] Delete node: ${id}`);
  }, [id]);

  const nodeInfo = {
    title: 'Webhook',
    description: `Efetua uma chamada HTTP para um endpoint da sua escolha.

Você pode enviar dados personalizados e processar a resposta para salvar em campos do contexto ou contato.`,
  };

  return (
    <>
      <div
        role="group"
        className={cn(
          'group relative w-[296px] rounded-2xl border bg-white shadow-[0_2px_8px_rgba(16,24,40,.06)]',
          selected
            ? `ring-2 ring-[${NODE_TOKENS.RING}] ring-offset-2 ring-offset-[${NODE_TOKENS.RING_OFFSET}] border-[#DDE3F0]`
            : 'border-[#DDE3F0]',
          'cursor-move'
        )}
      >
        {/* Menu de ações flutuante */}
        <NodeActionsMenu
          nodeId={id}
          onShowInfo={() => setShowInfo(true)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />

        {/* Conector de entrada */}
        <NodeConnector
          type="target"
          position={Position.Left}
          id="in"
          connected={isConnectedIn}
          label="Entrada do fluxo"
          className="!-left-[7.5px] !top-[24px]"
        />

        {/* Conteúdo do nó */}
        <div className="pt-3 pb-4 px-4 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Header: Ícone + Título */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 border border-purple-300 rounded-md px-1.5 py-0.5 flex items-center justify-center">
                <Code className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-[14px] text-neutral-900 leading-tight">
                Webhook
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(true);
              }}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Informações"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Preview da Configuração (quando configurado) */}
          {isConfigured && (
            <div
              className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2 cursor-pointer hover:bg-neutral-100 transition-colors"
              onClick={handleOpenDrawer}
            >
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide bg-neutral-200 px-1.5 py-0.5 rounded">
                  Endpoint
                </span>
                <p className="text-[12px] text-neutral-700 mt-1 break-all line-clamp-2">
                  {value.endpoint}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide bg-neutral-200 px-1.5 py-0.5 rounded">
                  Método
                </span>
                <p className="text-[12px] text-neutral-700 mt-1 font-medium">
                  {value.method}
                </p>
              </div>
              <p className="text-[12px] text-neutral-400 text-center">...</p>
            </div>
          )}

          {/* Botão Configurar (quando não configurado) */}
          {!isConfigured && (
            <Button
              variant="outline"
              className="w-full h-10 text-[14px] font-medium text-neutral-700"
              onClick={handleOpenDrawer}
            >
              Configurar
            </Button>
          )}

          {/* Conectores de saída (Sucesso e Falha) */}
          <div className="space-y-2">
            {/* Sucesso */}
            <div className="relative flex items-center justify-between h-10 px-3 rounded-lg border bg-white">
              <span className="text-[13px] text-neutral-700">Sucesso</span>
              <div
                className={cn(
                  'w-3 h-3 rounded-full border-2',
                  isConnectedSuccess
                    ? 'bg-green-500 border-green-600'
                    : 'bg-white border-green-500'
                )}
              />
              <NodeConnector
                type="source"
                position={Position.Right}
                id="out:success"
                connected={isConnectedSuccess}
                label="Sucesso"
                className="!-right-[7.5px] !top-1/2 !-translate-y-1/2"
              />
            </div>

            {/* Falha */}
            <div className="relative flex items-center justify-between h-10 px-3 rounded-lg border bg-white">
              <span className="text-[13px] text-neutral-700">Falha</span>
              <div
                className={cn(
                  'w-3 h-3 rounded-full border-2',
                  isConnectedError
                    ? 'bg-red-500 border-red-600'
                    : 'bg-white border-red-500'
                )}
              />
              <NodeConnector
                type="source"
                position={Position.Right}
                id="out:error"
                connected={isConnectedError}
                label="Falha"
                className="!-right-[7.5px] !top-1/2 !-translate-y-1/2"
              />
            </div>
          </div>

          {/* Badge de validação */}
          {!isConfigured && (
            <Badge
              variant="destructive"
              className="w-full justify-center text-[11px] py-1.5 bg-red-50 text-red-700 border-red-200"
            >
              É preciso configurar os dados do webhook
            </Badge>
          )}
        </div>
      </div>

      {/* Modal de informações */}
      <NodeInfoDialog
        open={showInfo}
        onClose={() => setShowInfo(false)}
        title={nodeInfo.title}
        description={nodeInfo.description}
      />
    </>
  );
});

WebhookNode.displayName = 'WebhookNode';

