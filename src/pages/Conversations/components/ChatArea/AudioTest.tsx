import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Mic, Volume2 } from 'lucide-react';

interface AudioTestProps {
  onTestComplete: (success: boolean) => void;
}

export const AudioTest: React.FC<AudioTestProps> = ({ onTestComplete }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const testAudio = async () => {
    setTesting(true);
    setTestResult('');

    try {
      console.log('🧪 Iniciando teste de áudio...');

      // 1. Testar permissões
      const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      console.log('🔐 Permissão do microfone:', permissions.state);

      if (permissions.state === 'denied') {
        throw new Error('Permissão do microfone negada');
      }

      // 2. Testar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      console.log('✅ Stream obtido:', {
        active: stream.active,
        tracks: stream.getTracks().length,
        audioTracks: stream.getAudioTracks().length
      });

      // 3. Testar formatos suportados
      const formats = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/wav'
      ];

      const supportedFormats = formats.filter(format => MediaRecorder.isTypeSupported(format));
      console.log('✅ Formatos suportados:', supportedFormats);

      if (supportedFormats.length === 0) {
        throw new Error('Nenhum formato de áudio suportado');
      }

      // 4. Testar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedFormats[0] });
      console.log('✅ MediaRecorder criado:', {
        mimeType: mediaRecorder.mimeType,
        state: mediaRecorder.state
      });

      // 5. Testar gravação curta
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('📊 Chunk recebido:', { size: event.data.size, type: event.data.type });
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const validChunks = chunks.filter(chunk => chunk.size > 0);
        const totalSize = validChunks.reduce((sum, chunk) => sum + chunk.size, 0);
        
        console.log('📊 Teste finalizado:', {
          totalChunks: chunks.length,
          validChunks: validChunks.length,
          totalSize
        });

        if (totalSize > 0) {
          setTestResult('✅ Teste bem-sucedido! Microfone funcionando corretamente.');
          onTestComplete(true);
        } else {
          setTestResult('❌ Teste falhou: Nenhum áudio foi capturado.');
          onTestComplete(false);
        }

        // Limpar stream
        stream.getTracks().forEach(track => track.stop());
        setTesting(false);
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ Erro no MediaRecorder durante teste:', event);
        setTestResult('❌ Erro no MediaRecorder.');
        onTestComplete(false);
        stream.getTracks().forEach(track => track.stop());
        setTesting(false);
      };

      // Iniciar teste de 2 segundos
      mediaRecorder.start(100);
      
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Erro no teste de áudio:', error);
      setTestResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      onTestComplete(false);
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2">
        <Volume2 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-blue-800">Teste de Áudio</h3>
      </div>
      
      <p className="text-sm text-blue-700 text-center">
        Vamos testar se o seu microfone está funcionando corretamente antes de gravar.
      </p>

      <Button
        onClick={testAudio}
        disabled={testing}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
      >
        {testing ? (
          <>
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Testando...
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Testar Microfone
          </>
        )}
      </Button>

      {testResult && (
        <div className={`text-sm p-3 rounded-md ${
          testResult.includes('✅') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {testResult}
        </div>
      )}

      {testResult.includes('✅') && (
        <p className="text-xs text-blue-600">
          Agora você pode usar a gravação de áudio normalmente!
        </p>
      )}
    </div>
  );
};
