// Validação de fluxos antes de salvar/publicar
import { Node } from '@xyflow/react';

export interface ValidationError {
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  field: string;
  message: string;
}

/**
 * Valida todos os nós do fluxo antes de salvar
 * Retorna array de erros encontrados
 */
export function validateFlow(nodes: Node[]): ValidationError[] {
  const errors: ValidationError[] = [];

  nodes.forEach((node) => {
    const nodeType = node.type || '';
    const nodeData = node.data || {};
    const nodeValue = (nodeData.value || {}) as any;

    // Validar nós de perguntas (ask-*)
    if (nodeType.startsWith('ask-')) {
      const nodeLabel = getNodeLabel(nodeType);

      // 1. Validar mensagem (obrigatória para todos)
      const headerRichText = nodeValue?.headerRichText;
      if (!headerRichText || (typeof headerRichText === 'string' && headerRichText.trim().length === 0)) {
        errors.push({
          nodeId: node.id,
          nodeType,
          nodeLabel,
          field: 'Mensagem',
          message: 'A mensagem da pergunta é obrigatória',
        });
      }

      // 2. Validar campo de destino (obrigatório para todos)
      const targetField = nodeValue?.targetField;
      const targetKey = targetField?.key;
      if (!targetKey || (typeof targetKey === 'string' && targetKey.trim().length === 0)) {
        errors.push({
          nodeId: node.id,
          nodeType,
          nodeLabel,
          field: 'Campo de destino',
          message: 'É necessário selecionar onde salvar a resposta',
        });
      }

      // 3. Validar mensagem de erro (obrigatória para ask-email, ask-number, ask-date e ask-file quando não há fluxo alternativo)
      if (nodeType === 'ask-email' || nodeType === 'ask-number' || nodeType === 'ask-date' || nodeType === 'ask-file') {
        const hasInvalidFlow = nodeValue?.invalidFlowEnabled === true;
        const validationErrorMessage = nodeValue?.validationErrorMessage;
        const hasErrorMessage = validationErrorMessage && typeof validationErrorMessage === 'string' && validationErrorMessage.trim().length > 0;

        if (!hasInvalidFlow && !hasErrorMessage) {
          errors.push({
            nodeId: node.id,
            nodeType,
            nodeLabel,
            field: 'Mensagem de erro',
            message: 'A mensagem de erro de validação é obrigatória quando não há fluxo alternativo configurado',
          });
        }
      }

      // 4. Validar regex customizado para ask-number
      if (nodeType === 'ask-number') {
        const validation = nodeValue?.validation;
        if (validation?.type === 'regex') {
          const customRegex = validation?.customRegex;
          if (!customRegex || (typeof customRegex === 'string' && customRegex.trim().length === 0)) {
            errors.push({
              nodeId: node.id,
              nodeType,
              nodeLabel,
              field: 'Regex customizado',
              message: 'É necessário fornecer uma expressão regular quando a validação é "Regex customizado"',
            });
          }
        }
      }

      // 5. Validar extensões permitidas para ask-file
      if (nodeType === 'ask-file') {
        const allowedExtensions = nodeValue?.allowedExtensions || [];
        if (allowedExtensions.length === 0) {
          errors.push({
            nodeId: node.id,
            nodeType,
            nodeLabel,
            field: 'Extensões permitidas',
            message: 'É necessário selecionar pelo menos uma extensão de arquivo',
          });
        }
      }
    }

    // Validar nós "Pedir para escolher"
    if (nodeType === 'action-choose') {
      const options = nodeValue?.options || [];
      
      if (options.length === 0) {
        errors.push({
          nodeId: node.id,
          nodeType,
          nodeLabel: 'Pedir para escolher',
          field: 'Opções',
          message: 'É necessário ter pelo menos uma opção',
        });
      }

      // Verificar se todas as opções têm texto
      options.forEach((option: any, index: number) => {
        const labelRichText = option?.labelRichText;
        if (!labelRichText || (typeof labelRichText === 'string' && labelRichText.trim().length === 0)) {
          errors.push({
            nodeId: node.id,
            nodeType,
            nodeLabel: 'Pedir para escolher',
            field: `Opção ${index + 1}`,
            message: 'O texto da opção não pode estar vazio',
          });
        }
      });
    }

    // Validar nós "Enviar mensagem"
    if (nodeType === 'action-message') {
      const blocks = nodeValue?.blocks || [];
      const hasContent = blocks.some((block: any) => {
        if (block?.type === 'text') {
          return block.content && block.content.trim().length > 0;
        } else if (block?.blockType === 'media') {
          return block.url && block.url.trim().length > 0;
        }
        return false;
      });

      if (!hasContent) {
        errors.push({
          nodeId: node.id,
          nodeType,
          nodeLabel: 'Enviar mensagem',
          field: 'Conteúdo',
          message: 'É necessário adicionar pelo menos uma mensagem ou mídia',
        });
      }
    }

    // Validar nós "Iniciar manualmente"
    if (nodeType === 'start-manual') {
      const title = nodeValue?.title;
      if (!title || (typeof title === 'string' && title.trim().length === 0)) {
        errors.push({
          nodeId: node.id,
          nodeType,
          nodeLabel: 'Iniciar manualmente',
          field: 'Título',
          message: 'O título é obrigatório',
        });
      }
    }

    // Validar nós "Iniciar por um canal"
    if (nodeType === 'start-channel') {
      const channelIds = nodeValue?.channelIds || [];
      if (channelIds.length === 0) {
        errors.push({
          nodeId: node.id,
          nodeType,
          nodeLabel: 'Iniciar por um canal',
          field: 'Canais',
          message: 'É necessário selecionar pelo menos um canal',
        });
      }
    }
  });

  return errors;
}

/**
 * Retorna um label amigável para o tipo de nó
 */
function getNodeLabel(nodeType: string): string {
  const labels: Record<string, string> = {
    'ask-question': 'Fazer uma pergunta',
    'ask-name': 'Perguntar por um nome',
    'ask-email': 'Perguntar por um e-mail',
    'ask-number': 'Perguntar por um número',
    'ask-date': 'Perguntar por uma data',
    'ask-file': 'Perguntar por um arquivo/mídia',
    'action-choose': 'Pedir para escolher',
    'action-message': 'Enviar mensagem',
    'start-manual': 'Iniciar manualmente',
    'start-channel': 'Iniciar por um canal',
  };

  return labels[nodeType] || nodeType;
}

/**
 * Formata os erros de validação em uma mensagem legível
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  const lines = [
    `❌ Encontrados ${errors.length} erro(s) no fluxo:\n`,
  ];

  errors.forEach((error, index) => {
    lines.push(`${index + 1}. ${error.nodeLabel} (${error.nodeId})`);
    lines.push(`   Campo: ${error.field}`);
    lines.push(`   ${error.message}\n`);
  });

  return lines.join('\n');
}

/**
 * Retorna um resumo dos erros agrupados por nó
 */
export function getValidationSummary(errors: ValidationError[]): { nodeId: string; nodeLabel: string; errorCount: number; errors: ValidationError[] }[] {
  const grouped = new Map<string, ValidationError[]>();

  errors.forEach((error) => {
    if (!grouped.has(error.nodeId)) {
      grouped.set(error.nodeId, []);
    }
    grouped.get(error.nodeId)!.push(error);
  });

  return Array.from(grouped.entries()).map(([nodeId, errors]) => ({
    nodeId,
    nodeLabel: errors[0].nodeLabel,
    errorCount: errors.length,
    errors,
  }));
}

