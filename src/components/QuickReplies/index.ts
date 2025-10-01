// Exportar todos os componentes de Respostas Rápidas

export { default as QuickReplyFormDrawer } from './QuickReplyFormDrawer';
export { default as QuickReplyViewDrawer } from './QuickReplyViewDrawer';
export { default as CategoryManagementDrawer } from './CategoryManagementDrawer';
export { default as QuickReplyPicker } from './QuickReplyPicker';
export { default as ChatIntegrationExample } from './ChatIntegrationExample';

// Re-exportar tipos relacionados
export type {
  QuickReply,
  Category,
  QuickReplyPickerItem,
  CreateQuickReplyDTO,
  UpdateQuickReplyDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  QuickReplyFilters,
  CategoryFilters,
  PickerFilters,
  QuickReplyScope,
  QuickReplyStatus,
  CategoryStatus,
} from '@/types/quickReplies';
