import React, { useEffect, useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  X, 
  Send,
  MicOff,
  AlertTriangle
} from 'lucide-react';
import { useAudioRecorder } from '../../../../hooks/useAudioRecorder';
import { AudioTest } from './AudioTest';

interface AudioRecorderProps {
  onSendAudio: (audioBlob: Blob) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onSendAudio,
  onCancel,
  isLoading = false
}) => {
  const [showTest, setShowTest] = useState(false);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);
  const [recordingAttempts, setRecordingAttempts] = useState(0);

  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    minimumRecordingTime,
    isStopping,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    resetRecording,
    recordForDuration,
    cleanup
  } = useAudioRecorder();

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Formatar tempo de gravação
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      setRecordingAttempts(prev => prev + 1);
      await startRecording();
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      
      // Se já tentou algumas vezes e falhou, mostrar teste
      if (recordingAttempts >= 1) {
        setShowTest(true);
      } else {
        alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
      }
    }
  };

  const handleTestComplete = (success: boolean) => {
    setTestPassed(success);
    if (success) {
      setShowTest(false);
      setRecordingAttempts(0);
    }
  };

  const handleQuickTest = async () => {
    try {
      console.log('🧪 Iniciando teste rápido de 3 segundos...');
      await recordForDuration(3);
    } catch (error) {
      console.error('Erro no teste rápido:', error);
      alert('Erro no teste rápido. Verifique os logs para mais detalhes.');
    }
  };

  const handleSendAudio = () => {
    if (audioBlob) {
      onSendAudio(audioBlob);
      resetRecording();
    }
  };

  const handleCancel = () => {
    cancelRecording();
    onCancel();
  };

  // Se deve mostrar teste de áudio
  if (showTest) {
    return <AudioTest onTestComplete={handleTestComplete} />;
  }

  // Se não está gravando e não tem áudio gravado, mostrar apenas o botão de iniciar
  if (!isRecording && !audioBlob) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleStartRecording}
            disabled={isLoading}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full h-8 w-8"
            title="Iniciar gravação de áudio"
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleQuickTest}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="text-xs px-3 py-1"
            title="Gravar automaticamente por 3 segundos (teste)"
          >
            🎯 Teste 3s
          </Button>

          {recordingAttempts > 0 && (
            <Button
              onClick={() => setShowTest(true)}
              variant="outline"
              size="sm"
              className="text-xs"
              title="Testar microfone"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Diagnóstico
            </Button>
          )}
        </div>

        {testPassed === false && (
          <div className="text-xs text-red-600 text-center bg-red-50 border border-red-200 rounded px-2 py-1">
            ⚠️ Problemas detectados. Use "Diagnóstico" para mais detalhes.
          </div>
        )}

        <div className="text-xs text-gray-500 text-center max-w-48">
          💡 Clique no microfone vermelho ou use "Teste 3s" para testar automaticamente
        </div>
      </div>
    );
  }

  // Interface de gravação ativa
  if (isRecording) {
    return (
      <div className="flex flex-col gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 min-w-0">
        {/* Indicador visual de gravação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isStopping ? 'bg-blue-500' :
              isPaused ? 'bg-yellow-500' :
              'bg-red-500 animate-pulse'
            }`} />
            <span className="text-sm font-mono text-red-700">
              {formatTime(recordingTime)}
            </span>
            {recordingTime < minimumRecordingTime && (
              <span className="text-xs text-gray-500">
                (mín. {minimumRecordingTime}s)
              </span>
            )}
          </div>

          {/* Status de parada */}
          {isStopping && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin" />
              Processando...
            </div>
          )}
        </div>

        {/* Dica para gravações curtas */}
        {recordingTime < 2 && !isStopping && (
          <div className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
            💡 <strong>Dica:</strong> Aguarde pelo menos 2 segundos para garantir boa qualidade de áudio
          </div>
        )}

        {/* Controles de gravação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Pausar/Retomar */}
            {!isStopping && (isPaused ? (
              <Button
                onClick={resumeRecording}
                variant="ghost"
                size="sm"
                className="p-1 text-red-600 hover:text-red-700 h-7 w-7"
                title="Continuar gravação"
              >
                <Play className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={pauseRecording}
                variant="ghost"
                size="sm"
                className="p-1 text-red-600 hover:text-red-700 h-7 w-7"
                title="Pausar gravação"
              >
                <Pause className="h-4 w-4" />
              </Button>
            ))}

            {/* Parar gravação */}
            {!isStopping && (
              <Button
                onClick={stopRecording}
                variant="ghost"
                size="sm"
                className="p-1 text-red-600 hover:text-red-700 h-7 w-7"
                title="Finalizar gravação"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Cancelar */}
          <Button
            onClick={handleCancel}
            variant="ghost"
            size="sm"
            className="p-1 text-gray-500 hover:text-gray-700 h-7 w-7"
            title="Cancelar gravação"
            disabled={isStopping}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Interface de áudio gravado (preview)
  if (audioBlob && audioUrl) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2 min-w-0">
        {/* Player de áudio */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MicOff className="h-4 w-4 text-green-600 flex-shrink-0" />
          
          {/* Áudio player nativo */}
          <audio 
            controls 
            src={audioUrl}
            className="flex-1 min-w-0 h-8"
            style={{ maxWidth: '200px' }}
            preload="metadata"
            onError={(e) => {
              console.error('Erro no player de áudio:', e);
            }}
          />
          
          <span className="text-xs text-green-700 flex-shrink-0">
            {formatTime(recordingTime)}
          </span>
        </div>

        {/* Controles de ação */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Enviar áudio */}
          <Button
            onClick={handleSendAudio}
            disabled={isLoading}
            className="p-1 bg-green-500 hover:bg-green-600 text-white rounded-full h-7 w-7"
            title="Enviar áudio"
          >
            {isLoading ? (
              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>

          {/* Cancelar */}
          <Button
            onClick={handleCancel}
            variant="ghost"
            size="sm"
            className="p-1 text-gray-500 hover:text-gray-700 h-7 w-7"
            title="Cancelar áudio"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
