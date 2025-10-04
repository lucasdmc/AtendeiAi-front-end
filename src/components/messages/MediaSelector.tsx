// Modal de seleção de mídia
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paperclip, Link as LinkIcon, Video } from 'lucide-react';

interface MediaSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'pdf' | 'audio' | 'video';
  url: string;
  name?: string;
}

export function MediaSelector({ open, onClose, onSelect }: MediaSelectorProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [videoInput, setVideoInput] = useState('');

  const handleUpload = () => {
    if (!uploadFile) return;

    // Determinar tipo de arquivo
    const type = getFileType(uploadFile.type);
    
    const media: MediaItem = {
      id: `media-${Date.now()}`,
      type,
      url: URL.createObjectURL(uploadFile),
      name: uploadFile.name,
    };

    onSelect(media);
    resetAndClose();
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;

    // Determinar tipo pela extensão ou content-type
    const type = getUrlType(urlInput);
    
    const media: MediaItem = {
      id: `media-${Date.now()}`,
      type,
      url: urlInput,
      name: urlInput.split('/').pop() || 'Arquivo',
    };

    onSelect(media);
    resetAndClose();
  };

  const handleVideoEmbed = () => {
    if (!videoInput.trim()) return;

    const media: MediaItem = {
      id: `media-${Date.now()}`,
      type: 'video',
      url: videoInput,
      name: 'Vídeo incorporado',
    };

    onSelect(media);
    resetAndClose();
  };

  const resetAndClose = () => {
    setUploadFile(null);
    setUrlInput('');
    setVideoInput('');
    onClose();
  };

  const getFileType = (mimeType: string): MediaItem['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'image'; // fallback
  };

  const getUrlType = (url: string): MediaItem['type'] => {
    const lower = url.toLowerCase();
    if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (lower.match(/\.(pdf)$/)) return 'pdf';
    if (lower.match(/\.(mp3|wav|ogg|m4a)$/)) return 'audio';
    if (lower.match(/\.(mp4|webm|mov|avi)$/)) return 'video';
    return 'image'; // fallback
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-900">
            Selecionar mídia
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Enviar arquivo</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="video">Vídeo</TabsTrigger>
          </TabsList>

          {/* Upload */}
          <TabsContent value="upload" className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                <Paperclip className="w-8 h-8 text-neutral-500" />
              </div>
              <p className="text-sm text-neutral-700 font-medium">
                Envie seu arquivo
              </p>
              <div className="flex items-center gap-2 w-full">
                <Input
                  type="text"
                  value={uploadFile?.name || ''}
                  placeholder="Escolher arquivo..."
                  readOnly
                  className="flex-1"
                />
                <label htmlFor="file-upload">
                  <Button type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                    Procurar
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf,audio/*,video/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={resetAndClose}>
                CANCELAR
              </Button>
              <Button onClick={handleUpload} disabled={!uploadFile}>
                ENVIAR
              </Button>
            </div>
          </TabsContent>

          {/* From URL */}
          <TabsContent value="url" className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                <LinkIcon className="w-8 h-8 text-neutral-500" />
              </div>
              <p className="text-sm text-neutral-700 font-medium">
                Digite uma URL
              </p>
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Abrir modal de variáveis */}}
              >
                Usar campo
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={resetAndClose}>
                CANCELAR
              </Button>
              <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                ENVIAR
              </Button>
            </div>
          </TabsContent>

          {/* Video Embed */}
          <TabsContent value="video" className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                <Video className="w-8 h-8 text-neutral-500" />
              </div>
              <p className="text-sm text-neutral-700 font-medium">
                Digite uma URL válida de <strong>Youtube</strong>, <strong>Vimeo</strong> ou <strong>Wistia</strong>
              </p>
              <Input
                type="url"
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                placeholder="https://..."
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={resetAndClose}>
                CANCELAR
              </Button>
              <Button onClick={handleVideoEmbed} disabled={!videoInput.trim()}>
                ENVIAR
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

