/**
 * Funções de validação para arquivos
 */

import { FileExtension } from '@/types/askFile';

/**
 * Labels amigáveis para as extensões
 */
export const FILE_EXTENSION_LABELS: Record<FileExtension, string> = {
  pdf: 'PDF',
  doc: 'Word (DOC)',
  docx: 'Word (DOCX)',
  xls: 'Excel (XLS)',
  xlsx: 'Excel (XLSX)',
  ppt: 'PowerPoint (PPT)',
  pptx: 'PowerPoint (PPTX)',
  txt: 'Texto (TXT)',
  csv: 'CSV',
  jpg: 'Imagem (JPG)',
  jpeg: 'Imagem (JPEG)',
  png: 'Imagem (PNG)',
  gif: 'Imagem (GIF)',
  mp4: 'Vídeo (MP4)',
  mp3: 'Áudio (MP3)',
  wav: 'Áudio (WAV)',
  zip: 'ZIP',
  rar: 'RAR',
};

/**
 * Categorias de arquivos
 */
export const FILE_CATEGORIES = {
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'] as FileExtension[],
  images: ['jpg', 'jpeg', 'png', 'gif'] as FileExtension[],
  videos: ['mp4'] as FileExtension[],
  audio: ['mp3', 'wav'] as FileExtension[],
  compressed: ['zip', 'rar'] as FileExtension[],
};

/**
 * Valida se um arquivo tem extensão permitida
 */
export function validateFileExtension(fileName: string, allowedExtensions: FileExtension[]): boolean {
  if (!fileName || allowedExtensions.length === 0) {
    return false;
  }

  const extension = getFileExtension(fileName);
  
  if (!extension) {
    return false;
  }

  return allowedExtensions.includes(extension as FileExtension);
}

/**
 * Extrai a extensão de um arquivo
 */
export function getFileExtension(fileName: string): string | null {
  const parts = fileName.split('.');
  
  if (parts.length < 2) {
    return null;
  }

  return parts[parts.length - 1].toLowerCase();
}

/**
 * Formata lista de extensões para exibição
 */
export function formatExtensionsList(extensions: FileExtension[]): string {
  if (extensions.length === 0) {
    return 'Nenhuma extensão selecionada';
  }

  if (extensions.length === 1) {
    return `.${extensions[0].toUpperCase()}`;
  }

  if (extensions.length <= 3) {
    return extensions.map(ext => `.${ext.toUpperCase()}`).join(', ');
  }

  return `${extensions.slice(0, 3).map(ext => `.${ext.toUpperCase()}`).join(', ')} +${extensions.length - 3}`;
}

