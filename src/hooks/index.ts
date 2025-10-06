// Exportar todos os hooks personalizados
export * from './useConversations';
export * from './useMessages';
export * from './useTemplates';
export * from './useSimulateMessage';
export * from './useAudioRecorder';
export * from './useScheduledMessages';
export * from './useClinicSettings';
export * from './useReceipts';
export * from './useCategories';
export * from './useQuickReplies';
export * from './useQuickReplyPicker';
export * from './use-mobile';

// Re-exportar React Query hooks comuns para conveniência
export { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
