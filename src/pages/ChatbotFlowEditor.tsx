// Página principal do Editor de Fluxo de Chatbot
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { ChevronRight, Home } from 'lucide-react';
import { EditorToolbar } from '@/components/flow-editor/EditorToolbar';
import { FlowCanvas } from '@/components/flow-editor/FlowCanvas';
import { BlockLibraryPanel } from '@/components/flow-editor/BlockLibraryPanel';
import { IdeasPanel } from '@/components/flow-editor/IdeasPanel';
import { FloatingControls } from '@/components/flow-editor/FloatingControls';
import { RenameDialog } from '@/components/flow-editor/RenameDialog';
import { useEditorStore } from '@/stores/editorStore';
import { flowsService } from '@/services/flowsService';
import { useToast } from '@/components/ui/use-toast';
import { BlockDefinition, TemplateFlow } from '@/types/flow';
import { flowDTOSchema } from '@/lib/flowSchema';

function EditorContent() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fitView, screenToFlowPosition, getViewport, zoomIn, zoomOut } = useReactFlow();

  // Store
  const flowId = useEditorStore((state) => state.id);
  const flowName = useEditorStore((state) => state.name);
  const nodes = useEditorStore((state) => state.nodes);
  const edges = useEditorStore((state) => state.edges);
  const viewport = useEditorStore((state) => state.viewport);
  const dirty = useEditorStore((state) => state.dirty);
  const canUndo = useEditorStore((state) => state.canUndo);
  const canRedo = useEditorStore((state) => state.canRedo);
  const showGrid = useEditorStore((state) => state.showGrid);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const showAlignmentGuides = useEditorStore((state) => state.showAlignmentGuides);
  
  const setId = useEditorStore((state) => state.setId);
  const setName = useEditorStore((state) => state.setName);
  const setNodes = useEditorStore((state) => state.setNodes);
  const setEdges = useEditorStore((state) => state.setEdges);
  const setDirty = useEditorStore((state) => state.setDirty);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const load = useEditorStore((state) => state.load);
  const reset = useEditorStore((state) => state.reset);
  const toggleGrid = useEditorStore((state) => state.toggleGrid);
  const toggleSnap = useEditorStore((state) => state.toggleSnap);
  const toggleAlignmentGuides = useEditorStore((state) => state.toggleAlignmentGuides);
  const exportJSON = useEditorStore((state) => state.exportJSON);
  const importJSON = useEditorStore((state) => state.importJSON);
  const clearCanvas = useEditorStore((state) => state.clearCanvas);
  const pushHistory = useEditorStore((state) => state.pushHistory);

  // UI State
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);

  // Carregar fluxo existente
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      flowsService
        .getFlow(id)
        .then((dto) => {
          load(dto);
        })
        .catch((error) => {
          toast({
            title: 'Erro ao carregar fluxo',
            description: error.message,
            variant: 'destructive',
          });
          navigate('/settings/chatbots');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      reset();
    }
  }, [id, load, reset, navigate, toast]);

  // Salvar fluxo
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);

      // Validar com Zod
      const dto = {
        id: flowId,
        name: flowName,
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type as any,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          sourceHandle: e.sourceHandle,
          target: e.target,
          targetHandle: e.targetHandle,
          label: e.label,
        })),
        viewport: getViewport(),
        updatedAt: new Date().toISOString(),
      };

      flowDTOSchema.parse(dto);

      if (flowId) {
        // Atualizar existente
        await flowsService.updateFlow(flowId, dto);
        toast({
          title: 'Fluxo salvo',
          description: 'Suas alterações foram salvas com sucesso.',
        });
      } else {
        // Criar novo
        const result = await flowsService.createFlow(dto);
        setId(result.id);
        navigate(`/settings/chatbots/editor/${result.id}`, { replace: true });
        toast({
          title: 'Fluxo criado',
          description: 'Seu fluxo foi criado com sucesso.',
        });
      }

      setDirty(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [flowId, flowName, nodes, edges, getViewport, setId, setDirty, navigate, toast]);

  // Adicionar bloco ao canvas
  const handleBlockClick = useCallback(
    (block: BlockDefinition, position?: { x: number; y: number }) => {
      const vp = getViewport();
      const defaultPosition = position || screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      const newNode = {
        id: `${block.type}-${Date.now()}`,
        type: block.type,
        position: defaultPosition,
        data: {
          label: block.title,
          description: '',
        },
      };

      setNodes((nds) => [...nds, newNode]);
      pushHistory();
      setShowBlockLibrary(false);
    },
    [getViewport, screenToFlowPosition, setNodes, pushHistory]
  );

  // Aplicar template
  const handleTemplateClick = useCallback(
    (template: TemplateFlow) => {
      const vp = getViewport();
      const centerX = -vp.x / vp.zoom + window.innerWidth / 2 / vp.zoom;
      const centerY = -vp.y / vp.zoom + window.innerHeight / 2 / vp.zoom;

      // Ajustar posições dos nós para o centro atual
      const offsetX = centerX - 250;
      const offsetY = centerY - 200;

      const newNodes = template.nodes.map((n) => ({
        ...n,
        id: `${n.id}-${Date.now()}`,
        position: {
          x: n.position.x + offsetX,
          y: n.position.y + offsetY,
        },
      }));

      const newEdges = template.edges.map((e, idx) => ({
        ...e,
        id: `${e.id}-${Date.now()}-${idx}`,
        source: newNodes.find((n) => n.id.startsWith(e.source))?.id || e.source,
        target: newNodes.find((n) => n.id.startsWith(e.target))?.id || e.target,
      }));

      setNodes((nds) => [...nds, ...newNodes]);
      setEdges((eds) => [...eds, ...newEdges]);
      pushHistory();
      setShowIdeas(false);

      // Centralizar nos novos nós
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 });
      }, 100);

      toast({
        title: 'Template aplicado',
        description: `O template "${template.title}" foi adicionado ao canvas.`,
      });
    },
    [getViewport, setNodes, setEdges, pushHistory, fitView, toast]
  );

  // Exportar JSON
  const handleExportJSON = useCallback(() => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flowName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'JSON exportado',
      description: 'O arquivo foi baixado com sucesso.',
    });
  }, [exportJSON, flowName, toast]);

  // Importar JSON
  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          importJSON(json);
          toast({
            title: 'JSON importado',
            description: 'O fluxo foi carregado com sucesso.',
          });
        } catch (error: any) {
          toast({
            title: 'Erro ao importar',
            description: error.message,
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [importJSON, toast]);

  // Limpar canvas com confirmação
  const handleClearCanvas = useCallback(() => {
    if (window.confirm('Tem certeza que deseja limpar todo o canvas? Esta ação não pode ser desfeita.')) {
      clearCanvas();
      toast({
        title: 'Canvas limpo',
        description: 'Todos os blocos foram removidos.',
      });
    }
  }, [clearCanvas, toast]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: Salvar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }

      // Ctrl/Cmd + 0: Resetar view
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        fitView({ padding: 0.2, duration: 400 });
      }

      // Ctrl/Cmd + +: Zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn({ duration: 200 });
      }

      // Ctrl/Cmd + -: Zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomOut({ duration: 200 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, undo, redo, fitView, zoomIn, zoomOut]);

  // Aviso antes de sair com alterações não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-600">Carregando fluxo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF3FF]">
      {/* Breadcrumb */}
      <div className="h-10 bg-white border-b border-slate-200 px-6 flex items-center gap-2 text-sm text-slate-600">
        <button
          onClick={() => navigate('/')}
          className="hover:text-slate-900 transition-colors"
        >
          <Home className="w-4 h-4" />
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => navigate('/settings')}
          className="hover:text-slate-900 transition-colors"
        >
          Configurações
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => navigate('/settings/chatbots')}
          className="hover:text-slate-900 transition-colors"
        >
          Chatbots
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">{flowName}</span>
      </div>

      {/* Toolbar */}
      <EditorToolbar
        flowName={flowName}
        isDirty={dirty}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenBlocks={() => setShowBlockLibrary(true)}
        onOpenIdeas={() => setShowIdeas(true)}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        onRename={() => setShowRenameDialog(true)}
        onSearch={() => toast({ title: 'Busca', description: 'Em breve' })}
        isSaving={isSaving}
      />

      {/* Canvas */}
      <FlowCanvas />

      {/* Painéis flutuantes */}
      {showBlockLibrary && (
        <BlockLibraryPanel
          onClose={() => setShowBlockLibrary(false)}
          onBlockClick={handleBlockClick}
        />
      )}
      {showIdeas && (
        <IdeasPanel
          onClose={() => setShowIdeas(false)}
          onTemplateClick={handleTemplateClick}
        />
      )}

      {/* Controles flutuantes */}
      <FloatingControls
        showGrid={showGrid}
        snapToGrid={snapToGrid}
        showAlignmentGuides={showAlignmentGuides}
        onResetView={() => fitView({ padding: 0.2, duration: 400 })}
        onZoomIn={() => zoomIn({ duration: 200 })}
        onZoomOut={() => zoomOut({ duration: 200 })}
        onToggleGrid={toggleGrid}
        onToggleSnap={toggleSnap}
        onToggleAlignmentGuides={toggleAlignmentGuides}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onClearCanvas={handleClearCanvas}
      />

      {/* Modal de renomear */}
      <RenameDialog
        open={showRenameDialog}
        currentName={flowName}
        onClose={() => setShowRenameDialog(false)}
        onSave={setName}
      />
    </div>
  );
}

// Wrapper com ReactFlowProvider
export default function ChatbotFlowEditor() {
  return (
    <ReactFlowProvider>
      <EditorContent />
    </ReactFlowProvider>
  );
}

