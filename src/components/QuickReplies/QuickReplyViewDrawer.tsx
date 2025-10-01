import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Edit,
  Copy,
  Trash2,
  Star,
  StarOff,
  Tag,
  Globe,
  User,
  Calendar,
  TrendingUp,
  Clock,
  Lightbulb,
  AtSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  useDeleteQuickReply,
  useDuplicateQuickReply,
  useToggleFavorite,
} from '@/hooks';
import {
  QuickReply,
  QuickReplyScope,
  QuickReplyStatus,
  AVAILABLE_PLACEHOLDERS,
} from '@/types/quickReplies';

interface QuickReplyViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quickReply: QuickReply | null;
  onEdit?: () => void;
}

const QuickReplyViewDrawer: React.FC<QuickReplyViewDrawerProps> = ({
  isOpen,
  onClose,
  quickReply,
  onEdit,
}) => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);

  // Hooks para mutations
  const deleteQuickReply = useDeleteQuickReply();
  const duplicateQuickReply = useDuplicateQuickReply();
  const { addToFavorites, removeFromFavorites, isLoading: favoriteLoading } = useToggleFavorite();

  if (!quickReply) return null;

  // Handlers
  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta resposta rápida?')) {
      await deleteQuickReply.mutateAsync(quickReply._id);
      onClose();
    }
  };

  const handleDuplicate = async () => {
    await duplicateQuickReply.mutateAsync(quickReply._id);
    toast({
      title: 'Resposta duplicada',
      description: 'Uma cópia da resposta foi criada com sucesso.',
    });
  };

  const handleToggleFavorite = async () => {
    if (quickReply.is_favorite) {
      await removeFromFavorites(quickReply._id);
    } else {
      await addToFavorites(quickReply._id);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(quickReply.content);
    toast({
      title: 'Conteúdo copiado',
      description: 'O conteúdo da resposta foi copiado para a área de transferência.',
    });
  };

  // Função para obter badge de status
  const getStatusBadge = (status: QuickReplyStatus) => {
    const variants = {
      ACTIVE: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      INACTIVE: { label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
    };
    const config = variants[status];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Função para obter badge de escopo
  const getScopeBadge = (scope: QuickReplyScope) => {
    const variants = {
      GLOBAL: { icon: Globe, label: 'Global', color: 'bg-blue-100 text-blue-800' },
      PERSONAL: { icon: User, label: 'Pessoal', color: 'bg-purple-100 text-purple-800' },
    };
    const config = variants[scope];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Processar conteúdo para preview (substituir placeholders por exemplos)
  const processContentForPreview = (content: string): string => {
    let processedContent = content;
    
    AVAILABLE_PLACEHOLDERS.forEach(placeholder => {
      const regex = new RegExp(placeholder.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      processedContent = processedContent.replace(regex, placeholder.example || placeholder.key);
    });
    
    return processedContent;
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Detectar placeholders no conteúdo
  const detectedPlaceholders = AVAILABLE_PLACEHOLDERS.filter(placeholder =>
    quickReply.content.includes(placeholder.key)
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {quickReply.title}
          </SheetTitle>
          <SheetDescription>
            Visualização detalhada da resposta rápida
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Ações principais */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className="text-gray-400 hover:text-yellow-500 transition-colors disabled:opacity-50"
              >
                {quickReply.is_favorite ? (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="h-5 w-5" />
                )}
              </button>
              <span className="text-sm text-gray-600">
                {quickReply.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>

          <Separator />

          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                {getStatusBadge(quickReply.status)}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Escopo</h4>
                {getScopeBadge(quickReply.scope)}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Categoria</h4>
                {quickReply.category ? (
                  <div className="flex items-center gap-2">
                    {quickReply.category.icon && (
                      <span className="text-sm">{quickReply.category.icon}</span>
                    )}
                    <span className="text-sm text-gray-900">{quickReply.category.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Sem categoria</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Uso
                </h4>
                <span className="text-sm text-gray-900">{quickReply.usage_count} vezes</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Criado em
                </h4>
                <span className="text-sm text-gray-900">{formatDate(quickReply.created_at)}</span>
              </div>
              {quickReply.last_used_at && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Último uso
                  </h4>
                  <span className="text-sm text-gray-900">{formatDate(quickReply.last_used_at)}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Conteúdo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Conteúdo</h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyContent}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                {detectedPlaceholders.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <AtSign className="h-4 w-4 mr-1" />
                        Placeholders ({detectedPlaceholders.length})
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <h4 className="font-medium">Placeholders Detectados</h4>
                        </div>
                        <div className="space-y-2">
                          {detectedPlaceholders.map((placeholder) => (
                            <div
                              key={placeholder.key}
                              className="p-2 rounded-md bg-gray-50 border border-gray-200"
                            >
                              <div className="flex items-center justify-between">
                                <code className="text-sm font-mono text-blue-600">
                                  {placeholder.key}
                                </code>
                                <span className="text-xs text-gray-500">
                                  {placeholder.example}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {placeholder.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Original
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-md bg-gray-50">
              {showPreview ? (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 font-medium">
                    Preview (com placeholders substituídos):
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-gray-900">
                    {processContentForPreview(quickReply.content)}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 font-medium">
                    Conteúdo original:
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-gray-900">
                    {quickReply.content}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500">
              {quickReply.content.length} caracteres
            </div>
          </div>

          {/* Informações adicionais */}
          {(quickReply.updated_at !== quickReply.created_at) && (
            <>
              <Separator />
              <div className="text-xs text-gray-500">
                Última atualização: {formatDate(quickReply.updated_at)}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuickReplyViewDrawer;


