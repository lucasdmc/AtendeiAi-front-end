import React from 'react';
import { AlertTriangle, Mic, Settings, RefreshCw } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface AudioTroubleshootingProps {
  onClose: () => void;
  onRetry: () => void;
}

export const AudioTroubleshooting: React.FC<AudioTroubleshootingProps> = ({
  onClose,
  onRetry
}) => {
  const troubleshootingSteps = [
    {
      icon: <Mic className="h-5 w-5 text-orange-600" />,
      title: "Verificar Permissões",
      description: "Certifique-se de que o navegador tem permissão para acessar o microfone.",
      steps: [
        "Clique no ícone de cadeado na barra de endereços",
        "Certifique-se de que 'Microfone' está definido como 'Permitir'",
        "Recarregue a página se necessário"
      ]
    },
    {
      icon: <Settings className="h-5 w-5 text-blue-600" />,
      title: "Configurações do Sistema",
      description: "Verifique as configurações de áudio do seu sistema operacional.",
      steps: [
        "Windows: Configurações > Privacidade > Microfone",
        "macOS: Preferências do Sistema > Segurança > Microfone",
        "Linux: Configurações de som do sistema"
      ]
    },
    {
      icon: <RefreshCw className="h-5 w-5 text-green-600" />,
      title: "Soluções Comuns",
      description: "Tente estas soluções se o problema persistir.",
      steps: [
        "Feche outros aplicativos que podem estar usando o microfone",
        "Teste com um navegador diferente (Chrome, Firefox, Safari)",
        "Reinicie o navegador completamente",
        "Verifique se o microfone funciona em outros aplicativos"
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-6 w-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-800">
          Problemas com Gravação de Áudio
        </h2>
      </div>

      <div className="space-y-6">
        {troubleshootingSteps.map((step, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              {step.icon}
              <h3 className="font-medium text-gray-800">{step.title}</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {step.description}
            </p>
            
            <ul className="space-y-2">
              {step.steps.map((stepText, stepIndex) => (
                <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    {stepIndex + 1}
                  </span>
                  {stepText}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Informações Técnicas</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Navegador:</strong> {navigator.userAgent.split(' ')[0]}</p>
          <p><strong>Suporte MediaRecorder:</strong> {typeof MediaRecorder !== 'undefined' ? '✅ Sim' : '❌ Não'}</p>
          <p><strong>Suporte getUserMedia:</strong> {typeof navigator.mediaDevices?.getUserMedia === 'function' ? '✅ Sim' : '❌ Não'}</p>
          <p><strong>HTTPS:</strong> {location.protocol === 'https:' ? '✅ Sim' : '❌ Não (necessário para microfone)'}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          onClick={onRetry}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
        
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1"
        >
          Fechar
        </Button>
      </div>
    </div>
  );
};
