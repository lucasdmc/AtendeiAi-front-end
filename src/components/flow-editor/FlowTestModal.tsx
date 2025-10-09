import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, CheckCircle, Phone } from 'lucide-react';
import { flowsService } from '../../services/flowsService';
import { useToast } from '../ui/use-toast';
import { useInstitution } from '../../contexts/InstitutionContext';

interface FlowTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowId: string;
  flowName: string;
}

interface TestResult {
  flow: {
    id: string;
    name: string;
    is_active: boolean;
  };
  channel: {
    id: string;
    name: string;
    type: string;
  };
  session: {
    id: string;
    status: string;
    phone_number: string;
  };
          test: {
            message: any;
            result: any;
            instructions?: {
              botNumber: string;
              howToTest: string;
            };
          };
}

export function FlowTestModal({ isOpen, onClose, flowId, flowName }: FlowTestModalProps) {
  const { toast } = useToast();
  const { selectedInstitution } = useInstitution();
  const [isActivating, setIsActivating] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Ativar fluxo automaticamente quando o modal abrir
  React.useEffect(() => {
    if (isOpen && !testResult) {
      handleActivateAndTest();
    }
  }, [isOpen]);

  const handleActivateAndTest = async () => {
    try {
      setIsActivating(true);
      
      const institutionId = selectedInstitution?._id || '';
      if (!institutionId) {
        throw new Error('Nenhuma instituição selecionada');
      }
      
      // 1. Ativar o fluxo
      await flowsService.activateFlow(flowId, institutionId);
      
      // 2. Testar o fluxo com mensagem padrão
      const result = await flowsService.testFlow(flowId, 'Olá', institutionId, '');
      setTestResult(result);
      
      toast({
        title: 'Fluxo ativado e testado',
        description: 'O fluxo foi ativado com sucesso e está pronto para receber mensagens.',
      });
      
    } catch (error: any) {
      toast({
        title: 'Erro ao ativar fluxo',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleClose = () => {
    setTestResult(null);
    setIsActivating(false);
    onClose();
  };


  const renderResultStep = () => {
    if (!testResult) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">✅ Fluxo Ativado!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Agora teste enviando uma mensagem real no WhatsApp
          </p>
        </div>

        {/* NÚMERO DO BOT - DESTAQUE */}
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-blue-700">
              <Phone className="mr-2 h-5 w-5" />
              📱 NÚMERO DO BOT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
                <p className="text-2xl font-mono font-bold text-blue-800">
                  {testResult.session.phone_number || 'Número não encontrado'}
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">
                  🚀 <strong>COMO TESTAR:</strong>
                </p>
                <p className="text-blue-700 mt-2">
                  1. Pegue seu celular<br/>
                  2. Abra o WhatsApp<br/>
                  3. Envie uma mensagem para o número acima<br/>
                  4. O bot responderá automaticamente!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Testar Fluxo - {flowName}</DialogTitle>
        </DialogHeader>

        {/* Sempre mostrar a tela de resultado (fluxo ativado) */}
        {isActivating ? (
          <div className="space-y-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Ativando fluxo...</h3>
              <p className="text-gray-600">Aguarde enquanto ativamos e testamos seu fluxo.</p>
            </div>
          </div>
        ) : (
          renderResultStep()
        )}
      </DialogContent>
    </Dialog>
  );
}
