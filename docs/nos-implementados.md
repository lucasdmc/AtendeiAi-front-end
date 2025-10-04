# Nós Implementados - Editor de Fluxo de Chatbot

Este documento descreve todos os nós (blocos) implementados no editor de fluxo de chatbot, suas finalidades e funcionalidades.

---

## 📑 Índice

- [INÍCIO](#início)
- [AÇÃO](#ação)
- [PERGUNTAR / CAPTURAR RESPOSTA](#perguntar--capturar-resposta)
- [FINALIZAÇÃO](#finalização)
- [INTEGRAÇÕES](#integrações)

---

## INÍCIO

Blocos responsáveis por iniciar o fluxo de conversação com o contato.

### Iniciar por um canal

**Tipo:** `start-channel`  
**Ícone:** WhatsApp (verde)

**Finalidade:**  
Inicia um fluxo de chatbot automaticamente quando um contato envia uma mensagem através de um ou mais canais específicos do WhatsApp conectados ao sistema.

**Funcionalidades:**
- Seleção de múltiplos canais (multi-select com busca)
- Validação: requer pelo menos um canal selecionado
- Exibe contador de canais selecionados
- Conectores: apenas saída (nó inicial)

**Quando usar:**  
Use este nó quando quiser que o fluxo seja acionado automaticamente ao receber mensagens em canais específicos do WhatsApp Business.

---

### Iniciar manualmente

**Tipo:** `start-manual`  
**Ícone:** Hand (azul)

**Finalidade:**  
Permite que atendentes ou administradores iniciem manualmente um fluxo de chatbot para um contato específico, com a possibilidade de capturar variáveis de contexto antes de iniciar.

**Funcionalidades:**
- Campo de título personalizável (padrão: "Início")
- Opção "Não listado" para ocultar da lista de fluxos manuais
- Sistema de variáveis personalizadas com tipos (Text, Number, Email, etc.)
- Preview das variáveis no card do canvas
- Drawer de configuração avançada
- Validação de campos obrigatórios (Type e Name)
- Conectores: apenas saída (nó inicial)

**Quando usar:**  
Use quando precisar que um atendente inicie manualmente um fluxo, especialmente quando for necessário capturar informações específicas antes de começar a automação.

---

## AÇÃO

Blocos que executam ações específicas durante o fluxo.

### Enviar mensagens

**Tipo:** `action-message`  
**Ícone:** MessageSquareText (verde)

**Finalidade:**  
Envia uma ou mais mensagens de texto e/ou mídias (imagens, vídeos, áudios, PDFs) para o contato através do WhatsApp.

**Funcionalidades:**
- Editor de texto rico (negrito, itálico, emoji, código, heading, listas, links, blockquote)
- Sistema de variáveis dinâmicas (@variável)
- Múltiplos blocos de mensagem em sequência
- Anexar mídias (imagens, PDFs, áudios, vídeos)
- Preview de mensagens e mídias no canvas
- Drag-and-drop para reordenar mensagens
- Drawer de edição completo
- Validação: requer ao menos uma mensagem ou mídia
- Conectores: entrada + saída

**Quando usar:**  
Use para enviar comunicações, informações, instruções ou qualquer conteúdo textual/multimídia ao contato durante o fluxo.

---

### Transferir para setor

**Tipo:** `action-transfer-sector`  
**Ícone:** Building2 (coral)

**Finalidade:**  
Transfere a conversa para um setor específico da organização, distribuindo entre os atendentes disponíveis daquele setor.

**Funcionalidades:**
- Seleção de setor (combobox com busca)
- Opção de transferir apenas se houver atendentes disponíveis
- Fluxo alternativo caso não seja possível transferir
- Badge de validação para conexões obrigatórias
- Modal de ajuda detalhado
- Conectores: entrada + saída principal + saída de fallback (condicional)

**Quando usar:**  
Use quando quiser direcionar a conversa para um setor específico da empresa (ex: vendas, suporte, financeiro).

---

### Transferir para atendente

**Tipo:** `action-transfer-agent`  
**Ícone:** UserRoundCog (coral)

**Finalidade:**  
Transfere a conversa para um atendente específico ou para um grupo de atendentes com base em critérios de distribuição.

**Funcionalidades:**
- 5 regras de transferência:
  - Específico (seleciona um atendente)
  - Aleatoriamente (distribui entre múltiplos)
  - Com menos conversas em aberto
  - Quem o atendeu anteriormente
  - Remover (remove atendente atual)
- Seleção single ou multi-select baseada na regra
- Opção de transferir apenas se disponível
- Fluxo alternativo se não for possível transferir
- Avatar e nome dos atendentes
- Badge de validação
- Modal de ajuda detalhado
- Conectores: entrada + saída principal + saída de fallback (condicional)

**Quando usar:**  
Use quando precisar designar a conversa para atendentes específicos ou distribuir com lógicas personalizadas.

---

### Transferir para agentes de IA

**Tipo:** `action-transfer-ai`  
**Ícone:** Sparkles (coral)

**Finalidade:**  
Transfere a conversa para um agente de IA (assistente virtual inteligente), com regras de distribuição entre múltiplos agentes.

**Funcionalidades:**
- 3 regras de transferência:
  - Específico (seleciona um agente)
  - Aleatoriamente (distribui entre múltiplos)
  - Com menos conversas em aberto
- Seleção single ou multi-select baseada na regra
- Fluxo alternativo se não for possível transferir
- Avatar e nome dos agentes de IA
- Badge de validação
- Modal de ajuda detalhado
- Conectores: entrada + saída principal + saída de fallback (condicional)

**Quando usar:**  
Use quando quiser que um assistente de IA assuma a conversa, especialmente para automação avançada com processamento de linguagem natural.

---

### Pedir para escolher

**Tipo:** `action-choose`  
**Ícone:** ListChecks (azul)

**Finalidade:**  
Apresenta uma lista de opções para o contato escolher, criando um menu interativo onde cada escolha pode levar a um fluxo diferente.

**Funcionalidades:**
- Mensagem inicial (header) opcional
- Lista de opções personalizáveis (mínimo 1, sem limite)
- Numeração com emoji (1️⃣, 2️⃣, 3️⃣) ou simples (1, 2, 3)
- Separadores customizáveis (espaço, ponto, dois pontos, traço, parêntese)
- Editor de texto rico para cada opção
- Mensagem final (footer) opcional
- Drag-and-drop para reordenar opções
- Fluxo para resposta inválida (após 3 tentativas)
- Fluxo para timeout (se não responder no tempo definido)
- Preview formatado no canvas
- Drawer de configuração completo
- Conectores dinâmicos: entrada + 1 saída por opção + fallbacks opcionais

**Quando usar:**  
Use para criar menus de navegação, questionários de múltipla escolha ou qualquer situação onde o contato precise escolher entre opções pré-definidas.

---

### Status esperando

**Tipo:** `action-waiting-status`  
**Ícone:** Hourglass (azul)

**Finalidade:**  
Marca ou desmarca a conversa como "esperando", afetando como ela aparece nas filas de atendimento e relatórios.

**Funcionalidades:**
- Botões toggle: Sim / Não
- Mudança instantânea de estado
- Modal de ajuda explicativo
- Conectores: entrada + saída

**Quando usar:**  
Use quando quiser alterar o status de espera da conversa, por exemplo, marcando como "não esperando" enquanto o contato preenche um formulário, e depois marcando como "esperando" quando finalizar.

---

### Privar ou liberar

**Tipo:** `action-privacy`  
**Ícone:** Lock (vermelho)

**Finalidade:**  
Marca ou desmarca a conversa como privada, controlando quem pode visualizá-la no sistema.

**Funcionalidades:**
- Botões toggle: Privar / Liberar
- Requer que a conversa tenha um atendente designado
- Modal de ajuda com alertas
- Conectores: entrada + saída

**Quando usar:**  
Use quando precisar tornar uma conversa privada (visível apenas para o atendente designado) ou liberá-la para outros atendentes.

---

### Fluxo de espera

**Tipo:** `action-waiting-flow`  
**Ícone:** Hourglass (azul)

**Finalidade:**  
Ativa ou desativa o fluxo automático de espera configurado na organização, que é executado quando o atendente não responde no tempo determinado.

**Funcionalidades:**
- Botões toggle: Ativar / Desativar
- Modal de ajuda explicativo
- Conectores: entrada + saída

**Quando usar:**  
Use para controlar dinamicamente se o fluxo de espera deve ser executado para aquela conversa específica.

---

### Aguardar

**Tipo:** `action-wait`  
**Ícone:** Clock (azul)

**Finalidade:**  
Pausa o fluxo por um período de tempo determinado antes de continuar para a próxima ação, com opção de fluxo alternativo se o contato responder durante a espera.

**Funcionalidades:**
- Dois modos:
  - **Fixo**: tempo definido (15 minutos, 2 horas, 3 dias, etc.)
  - **Variável**: usa valor de uma variável do contexto
- 6 unidades de tempo: Segundos, Minutos, Horas, Dias, Semanas, Meses
- Input numérico para valor
- Checkbox: "Ativar fluxo se contato responder antes"
- Badge de validação
- Modal de ajuda
- Conectores: entrada + saída principal + saída de resposta antecipada (condicional)

**Quando usar:**  
Use quando precisar dar tempo ao contato para realizar uma ação (ex: "aguarde 24 horas antes de enviar lembrete") ou criar intervalos estratégicos na comunicação.

---

## PERGUNTAR / CAPTURAR RESPOSTA

Blocos especializados em capturar e validar informações do contato.

### Fazer uma pergunta

**Tipo:** `ask-question`  
**Ícone:** MessageSquareText (azul)

**Finalidade:**  
Captura uma resposta de texto livre do contato, com opções de validação customizadas.

**Funcionalidades:**
- Mensagem da pergunta (editor rico, obrigatória)
- Campo para salvar resposta (Contexto ou Contato)
- Criação de novos campos inline
- Validações opcionais:
  - Nenhuma (texto livre)
  - Regex (expressão regular customizada)
  - Tamanho do texto (mínimo/máximo de caracteres)
- Preview da pergunta no canvas
- Display do campo selecionado no card
- Fluxo para resposta inválida (após 3 tentativas)
- Fluxo para timeout (se não responder)
- Drawer de configuração completo
- Conectores: entrada + saída válida + fallbacks opcionais

**Quando usar:**  
Use para capturar informações gerais do contato quando não houver validação específica necessária, ou quando precisar aplicar validações customizadas.

---

### Perguntar por um nome

**Tipo:** `ask-name`  
**Ícone:** User (azul)

**Finalidade:**  
Captura e valida o nome completo do contato.

**Funcionalidades:**
- Idêntico ao "Fazer uma pergunta"
- Validações padrão para nomes
- Campo de destino tipado como "Text"
- Conectores: entrada + saída válida + fallbacks opcionais

**Quando usar:**  
Use especificamente para capturar nomes de contatos, garantindo formatação adequada.

---

### Perguntar por um e-mail

**Tipo:** `ask-email`  
**Ícone:** AtSign (azul)

**Finalidade:**  
Captura e valida endereços de e-mail do contato.

**Funcionalidades:**
- Validação automática de formato de e-mail
- Mensagem de erro customizável (obrigatória se não houver fluxo alternativo)
- Campo de destino tipado como "Email"
- Até 3 tentativas antes de fluxo alternativo
- Preview da pergunta no canvas
- Conectores: entrada + saída válida + fallbacks opcionais

**Quando usar:**  
Use para capturar e-mails com garantia de formato válido.

---

### Perguntar por um número

**Tipo:** `ask-number`  
**Ícone:** Hash (azul)

**Finalidade:**  
Captura e valida números com opções de formatação e validação específicas (CPF, CNPJ, CRM, telefone, etc.).

**Funcionalidades:**
- Formatos de validação:
  - Auto (número simples)
  - CPF (com máscara)
  - CNPJ (com máscara)
  - CRM (formato médico)
  - Telefone (com máscara)
  - CEP (com máscara)
  - Cartão de crédito
  - Regex customizada
- Prefixo opcional (ex: "R$ " para valores)
- Valores mínimo e máximo
- Mensagem de erro customizável
- Campo de destino tipado como "Number"
- Preview da pergunta no canvas
- Conectores: entrada + saída válida + fallbacks opcionais

**Quando usar:**  
Use para capturar documentos, telefones, valores numéricos ou qualquer dado que precise de validação numérica específica.

---

### Perguntar por uma data

**Tipo:** `ask-date`  
**Ícone:** CalendarDays (azul)

**Finalidade:**  
Captura e valida datas fornecidas pelo contato.

**Funcionalidades:**
- Formato de data configurável (DD/MM/YYYY, MM/DD/YYYY, etc.)
- Validação automática de formato
- Mensagem de erro customizável (obrigatória)
- Campo de destino tipado como "Date"
- Até 3 tentativas antes de fluxo alternativo
- Preview da pergunta no canvas
- Conectores: entrada + saída válida + fallbacks opcionais

**Quando usar:**  
Use para capturar datas de nascimento, agendamentos ou qualquer informação temporal.

---

### Perguntar por um arquivo/mídia

**Tipo:** `ask-file`  
**Ícone:** Paperclip (azul)

**Finalidade:**  
Captura arquivos ou mídias enviados pelo contato através do WhatsApp.

**Funcionalidades:**
- Validação por extensões permitidas (jpg, png, pdf, mp4, etc.)
- Sistema de chips para múltiplas extensões
- Mensagem de erro customizável (obrigatória)
- Campo de destino tipado como "File"
- Até 3 tentativas antes de fluxo alternativo
- Preview da pergunta no canvas
- Conectores: entrada + saída válida + fallbacks opcionais

**Quando usar:**  
Use quando precisar que o contato envie documentos, fotos, vídeos ou qualquer tipo de arquivo.

---

## FINALIZAÇÃO

Blocos que encerram o fluxo.

### Finalizar conversa

**Tipo:** `end-conversation`  
**Ícone:** CheckCircle (verde)

**Finalidade:**  
Finaliza a conversa automaticamente, marcando-a como concluída no sistema.

**Funcionalidades:**
- Seleção de quem fechou:
  - **Ninguém**: chat fechado sem especificar responsável
  - **Dono do chat**: atendente atual registrado como responsável
- Nó terminal (sem saída)
- Modal de ajuda detalhado
- Conectores: apenas entrada

**Quando usar:**  
Use quando quiser encerrar automaticamente uma conversa após concluir todas as ações necessárias. Importante para métricas e relatórios.

---

## INTEGRAÇÕES

Blocos que se integram com sistemas externos.

### Webhook

**Tipo:** `integration-webhook`  
**Ícone:** Code (roxo)

**Finalidade:**  
Realiza chamadas HTTP para APIs externas, permitindo integração com qualquer sistema ou serviço que ofereça endpoints REST.

**Funcionalidades:**
- **Endpoint**: URL completa da API
- **Métodos HTTP**: POST, PUT, PATCH, GET
- **Parâmetros da URL**:
  - Parse automático de query parameters
  - Adicionar/remover pares chave-valor
  - Sincronização bidirecional URL ↔ Parâmetros
- **Cabeçalhos HTTP**: Headers customizados
- **Conteúdo (Body)**: JSON com suporte a variáveis
- **Retorno**:
  - Mapeamento de resposta via JSON path
  - Salvar valores em campos do Contexto ou Contato
  - Múltiplos mapeamentos
  - Modal de ajuda com sintaxe
- **Preview no canvas**:
  - Exibe endpoint e método quando configurado
  - Clique para editar
- **Conectores independentes**:
  - Sucesso (verde) - quando chamada retorna 200-299
  - Falha (vermelho) - quando chamada falha ou retorna erro
- **Drawer de configuração completo**
- **Modal de variáveis** com busca
- **Validação de endpoint obrigatório**

**Quando usar:**  
Use para integrar com CRMs, ERPs, sistemas de pagamento, APIs de terceiros ou qualquer serviço web. Ideal para enriquecer dados, validar informações em sistemas externos ou acionar processos em outras plataformas.

---

## 📊 Estatísticas

- **Total de nós implementados**: 20
- **Categorias**: 5 (Início, Ação, Perguntar, Finalização, Integrações)
- **Nós com drawer de configuração**: 13
- **Nós sem drawer (configuração inline)**: 7
- **Nós com fluxos condicionais**: 10
- **Nós com validação de dados**: 6

---

## 🎨 Padrões de Design

Todos os nós seguem padrões consistentes:

### Visual
- Card branco com `rounded-2xl` e sombra suave
- Largura fixa de 296px
- Badge colorido com ícone no header
- Borda azul quando selecionado
- Conectores de 15px (cinza/azul)

### Interações
- Menu de ações flutuante (Info, Copy ID, Duplicate, Delete)
- Cursor `move` ao passar sobre o nó
- Modal de informações (`?`) com documentação
- Validações visuais com badges de erro
- Tooltips informativos

### Conectores
- **Input**: esquerda, cinza/azul
- **Output**: direita, cinza/azul
- Posicionamento preciso no header ou alinhado com elementos
- Estados visuais (conectado/desconectado)

### Drawers
- Abertura pela direita
- Largura de 540px (padrão)
- ScrollArea no body
- Auto-save ao fechar
- Validações em tempo real

---

## 🚀 Próximos Passos

Para novos nós que possam ser implementados no futuro:

### Condições
- Condição por dia da semana
- Condição por horário
- Condição simples (if/else)
- Condição múltipla (switch/case)

### Ações
- Adicionar nota interna
- Editar tags do contato
- Editar campo do contato
- Enviar template do WhatsApp
- Acionar outro fluxo

### Utilitários
- Bloco de notas (documentação)

---

## 📝 Notas Técnicas

### Arquitetura
- Framework: React + TypeScript
- Canvas: React Flow (@xyflow/react)
- UI: shadcn/ui + Tailwind CSS
- State: Zustand (com histórico de undo/redo)
- Validação: Zod

### Estrutura de Arquivos
```
src/
├── components/
│   ├── canvas/
│   │   └── nodes/          # Componentes dos nós
│   └── drawers/            # Drawers de configuração
├── types/                   # TypeScript types
├── lib/
│   ├── blockDefinitions.ts # Definições dos blocos
│   └── flowValidation.ts   # Validações
└── stores/
    └── editorStore.ts      # State management
```

### Convenções de Nomenclatura
- **Tipos de nós**: `category-name` (ex: `action-message`, `ask-email`)
- **Componentes**: `PascalCase` + `Node` (ex: `SendMessageNode`)
- **Props**: `NodeData` (ex: `SendMessageData`)
- **Conectores**: `in`, `out`, `out:success`, `out:fallback`

---

**Última atualização**: Dezembro 2024  
**Versão do documento**: 1.0

