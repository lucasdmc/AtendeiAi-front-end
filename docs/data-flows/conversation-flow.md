# 🔄 Fluxo de Dados - Conversas

## 📋 Visão Geral

Este documento detalha como os dados fluem na funcionalidade principal do sistema: as conversas.

## 💬 Fluxo Principal de Conversa

### 1️⃣ Carregamento Inicial
```
Frontend                    Backend
   |                          |
   |-- GET /conversations --> |
   |                          |-- Query database
   |                          |-- Apply filters
   |<-- Conversation list ----| 
   |                          |
   |-- Select conversation -->|
   |                          |
   |-- GET /messages/:id ---->|
   |                          |-- Get message history
   |<-- Message history ------|
```

### 2️⃣ Recebimento de Nova Mensagem
```
WhatsApp/External           Backend                Frontend
     |                        |                      |
     |-- Webhook message ---->|                      |
     |                        |-- Save to DB        |
     |                        |-- WebSocket ------->|
     |                        |                      |-- Update UI
     |                        |                      |-- Show notification
     |                        |                      |-- Increment unread
```

### 3️⃣ Envio de Mensagem
```
Frontend                    Backend                WhatsApp/External
   |                          |                           |
   |-- POST /messages ------->|                           |
   |                          |-- Save to DB             |
   |                          |-- Send to WhatsApp ----->|
   |<-- Success response -----|                           |
   |-- Update UI locally      |                           |
   |                          |-- WebSocket broadcast    |
   |<-- Confirmation ---------|                           |
```

## 🏷️ Fluxo de Flags

### 🎯 Aplicar Flag
```
Frontend                    Backend
   |                          |
   |-- Open flags modal ----->|
   |                          |
   |-- GET /flags ----------->|
   |<-- Available flags ------|
   |                          |
   |-- Select flag ---------->|
   |                          |
   |-- PUT /conversations/:id/flag -> |
   |                          |-- Update conversation
   |                          |-- Log flag application
   |<-- Success --------------|
   |-- Update UI locally      |
```

### 🔍 Filtrar por Flags
```
Frontend                    Backend
   |                          |
   |-- Select flag filter --->|
   |                          |
   |-- GET /conversations ---->|
   |    ?flag_ids=1,2,3       |-- Filter by flags
   |                          |-- Apply pagination
   |<-- Filtered list --------|
   |-- Update conversation list
```

## 📝 Fluxo de Templates

### 🎯 Usar Template
```
Frontend                    Backend
   |                          |
   |-- Open templates modal ->|
   |                          |
   |-- GET /templates ------->|
   |<-- Available templates --|
   |                          |
   |-- Select template ------>|
   |                          |
   |-- PUT /templates/:id/use -> |
   |                          |-- Increment usage_count
   |<-- Updated template -----|
   |-- Insert in message input|
```

### 📊 Gerenciar Templates (Settings)
```
Frontend                    Backend
   |                          |
   |-- CREATE template ------>|
   |                          |-- Validate data
   |                          |-- Save to DB
   |<-- New template ---------|
   |-- Update local list      |
   |                          |
   |-- EDIT template -------->|
   |                          |-- Update in DB
   |<-- Updated template -----|
   |-- Update local list      |
   |                          |
   |-- DELETE template ------>|
   |                          |-- Soft delete
   |<-- Success --------------|
   |-- Remove from local list |
```

## 🔄 Fluxo de Estados da Conversa

### 🤖 IA → Manual (Assumir Conversa)
```
Frontend                    Backend                Bot Service
   |                          |                        |
   |-- Click "Assumir" ------>|                        |
   |                          |-- Update assigned_user |
   |                          |-- Set bot_active=false -> |
   |                          |                        |-- Stop auto-responses
   |<-- Success --------------|                        |
   |-- Update UI (Manual flag)|                        |
   |-- Hide "Assumir" button  |                        |
```

### 👤 Manual → IA (Liberar Conversa)
```
Frontend                    Backend                Bot Service  
   |                          |                        |
   |-- Click "Liberar" ------>|                        |
   |                          |-- Clear assigned_user  |
   |                          |-- Set bot_active=true --> |
   |                          |                        |-- Resume auto-responses
   |<-- Success --------------|                        |
   |-- Update UI (IA flag)    |                        |
   |-- Show "Assumir" button  |                        |
```

## 📅 Fluxo de Mensagens Programadas

### ⏰ Agendar Mensagem
```
Frontend                    Backend                Scheduler Service
   |                          |                        |
   |-- Schedule message ----->|                        |
   |                          |-- Validate datetime    |
   |                          |-- Save to queue ------>|
   |<-- Confirmation ---------|                        |-- Set timer
   |-- Show success alert     |                        |
   |                          |                        |
   |                          |<-- Send at time -------|
   |                          |-- Process message      |
   |                          |-- Send to WhatsApp     |
   |<-- WebSocket notification|                        |
   |-- Update conversation    |                        |
```

## 🔍 Fluxo de Busca

### 📝 Busca em Conversas
```
Frontend                    Backend
   |                          |
   |-- Type search term ----->|
   |                          |
   |-- GET /conversations ---->|
   |    ?search=termo         |-- Search in:
   |                          |   - customer_name
   |                          |   - customer_phone  
   |                          |   - last_message
   |<-- Filtered results -----|
   |-- Update list in real-time
```

### 🔍 Busca em Mensagens
```
Frontend                    Backend
   |                          |
   |-- Click search icon ---->|
   |-- Type in conversation ->|
   |                          |
   |-- GET /messages/:conv_id -> |
   |    ?search=termo         |-- Full-text search
   |                          |-- Highlight matches
   |<-- Filtered messages ----|
   |-- Show only matching     |
   |-- Highlight search terms |
```

## 📁 Fluxo de Arquivos

### 📤 Upload de Arquivo
```
Frontend                    Backend                Storage
   |                          |                      |
   |-- Select file ---------->|                      |
   |                          |-- Validate file     |
   |                          |-- Generate UUID     |
   |                          |-- Upload to storage -> |
   |                          |                      |-- Save file
   |                          |<-- File URL ---------|
   |                          |-- Save metadata     |
   |<-- File info ------------|                      |
   |-- Update file list       |                      |
```

### 📥 Download de Arquivo
```
Frontend                    Backend                Storage
   |                          |                      |
   |-- Click download ------->|                      |
   |                          |-- Verify permissions |
   |                          |-- Get file URL ------>|
   |                          |<-- File stream -------|
   |<-- File download --------|                      |
```

## 🔄 Sincronização em Tempo Real

### 📡 WebSocket Events

#### 📨 Mensagem Nova
```json
{
  "type": "message_received",
  "conversation_id": "uuid",
  "message": {
    "id": "uuid",
    "content": "Olá!",
    "sender_type": "customer",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### 🏷️ Flag Aplicada
```json
{
  "type": "flag_applied",
  "conversation_id": "uuid", 
  "flag": {
    "id": "uuid",
    "name": "Urgente",
    "color": "#EF4444"
  }
}
```

#### 🔄 Status Mudou
```json
{
  "type": "status_changed",
  "conversation_id": "uuid",
  "from": "ai",
  "to": "manual",
  "assigned_user": {
    "id": "uuid",
    "name": "João Silva"
  }
}
```

## 🎯 Considerações Técnicas

### ⚡ Performance
- **Índices**: Em campos de busca frequente
- **Cache**: Para templates e flags
- **Pagination**: Para listas grandes
- **Debounce**: Em buscas em tempo real

### 🔒 Segurança
- **Isolamento**: Por clínica
- **Validação**: Todos os inputs
- **Rate limiting**: Para mensagens
- **Permissions**: Por endpoint

### 🔄 Escalabilidade
- **Queue system**: Para mensagens programadas
- **Load balancing**: Para WebSocket
- **Database sharding**: Se necessário
- **CDN**: Para arquivos estáticos

---

📝 **Este fluxo garante uma experiência fluida e em tempo real para os usuários.**
