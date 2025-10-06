import { useState, useRef, useCallback } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  minimumRecordingTime: number; // Tempo mínimo em segundos
  isStopping: boolean; // Flag para indicar que está parando
}

export interface AudioRecorderControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  cancelRecording: () => void;
  resetRecording: () => void;
  recordForDuration: (durationSeconds?: number) => Promise<void>;
}

export const useAudioRecorder = () => {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    audioBlob: null,
    audioUrl: null,
    minimumRecordingTime: 1, // 1 segundo mínimo
    isStopping: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        recordingTime: prev.recordingTime + 1
      }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && state.isRecording && !state.isStopping) {
      console.log(`🛑 Solicitando parada da gravação (tempo atual: ${state.recordingTime}s, estado: ${mediaRecorderRef.current.state})`);

      // Marcar que está parando para evitar múltiplas chamadas
      setState(prev => ({ ...prev, isStopping: true }));

      // SOLUÇÃO: Forçar coleta de dados imediatamente
      console.log('🔄 Forçando coleta de dados...');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        // Solicitar dados imediatamente
        mediaRecorderRef.current.requestData();
        console.log('📤 Dados solicitados imediatamente');
      }

      // Aguardar tempo mínimo (pelo menos 500ms para garantir dados)
      const minimumWait = Math.max(500, state.minimumRecordingTime * 1000 - state.recordingTime * 1000);
      console.log(`⏳ Aguardando ${minimumWait}ms para coleta de dados`);

      await new Promise(resolve => setTimeout(resolve, minimumWait));
      console.log('✅ Tempo de coleta aguardado');

      // Aguardar mais um pouco para processamento
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verificar se temos chunks antes de parar
      const currentChunks = chunksRef.current.length;
      console.log(`📊 Chunks atuais antes de parar: ${currentChunks}`);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('🛑 Parando MediaRecorder...');
        mediaRecorderRef.current.stop();
      }

      stopTimer();
      stopHeartbeat();
      console.log('⏰ Timer e heartbeat parados');
    } else {
      console.log('⚠️ Stop ignorado - não está gravando ou já está parando');
    }
  }, [state.isRecording, state.isStopping, state.recordingTime, state.minimumRecordingTime, stopTimer, stopHeartbeat]);

  const startHeartbeat = useCallback(() => {
    heartbeatRef.current = setInterval(() => {
      if (mediaRecorderRef.current && state.isRecording) {
        const recorderState = mediaRecorderRef.current.state;
        const streamActive = streamRef.current?.active;
        const tracksForHeartbeat = streamRef.current?.getAudioTracks();
        const trackStates = tracksForHeartbeat?.map(track => ({
          enabled: track.enabled,
          readyState: track.readyState
        }));

        console.log('💓 Heartbeat - Estado da gravação:', {
          recorderState,
          streamActive,
          trackStates,
          chunksCount: chunksRef.current.length,
          recordingTime: state.recordingTime
        });

        // Verificar se algo está errado
        if (recorderState !== 'recording') {
          console.error('❌ MediaRecorder não está gravando! State:', recorderState);
          stopRecording();
          return;
        }

        if (!streamActive) {
          console.error('❌ Stream não está ativo!');
          stopRecording();
          return;
        }

        if (!tracksForHeartbeat || tracksForHeartbeat.length === 0) {
          console.error('❌ Não há tracks de áudio!');
          stopRecording();
          return;
        }

        if (tracksForHeartbeat.some(track => track.readyState === 'ended')) {
          console.error('❌ Track de áudio terminou!');
          stopRecording();
          return;
        }
      }
    }, 2000); // Verificar a cada 2 segundos
  }, [state.isRecording, state.recordingTime, stopRecording]);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Solicitando permissão do microfone...');

      // Limpar qualquer stream anterior para evitar conflitos
      if (streamRef.current) {
        console.log('🧹 Limpando stream anterior...');
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Track parado:', track.label);
        });
        streamRef.current = null;
      }

      // Solicitar permissão para usar o microfone com configurações mais básicas
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });

      console.log('✅ Permissão concedida. Stream obtido:', {
        active: stream.active,
        tracks: stream.getTracks().length,
        audioTracks: stream.getAudioTracks().length
      });

      // Verificar se o stream tem tracks de áudio ativos
      const audioTracksForSetup = stream.getAudioTracks();
      if (audioTracksForSetup.length === 0) {
        throw new Error('Nenhum track de áudio encontrado no stream');
      }

      console.log('🔊 Track de áudio:', {
        enabled: audioTracksForSetup[0].enabled,
        muted: audioTracksForSetup[0].muted,
        readyState: audioTracksForSetup[0].readyState,
        settings: audioTracksForSetup[0].getSettings()
      });

      // Verificar se já há uma gravação em andamento e pará-la
      if (state.isRecording) {
        console.warn('⚠️ Já há uma gravação em andamento, parando antes de iniciar nova');
        await stopRecording();
        await new Promise(resolve => setTimeout(resolve, 100)); // Aguardar um pouco
      }

      // Verificar se o MediaRecorder ainda está ativo de gravações anteriores
      if (mediaRecorderRef.current) {
        const currentState = mediaRecorderRef.current.state;
        console.log('🔍 Estado do MediaRecorder anterior:', currentState);

        if (currentState !== 'inactive') {
          console.warn('⚠️ MediaRecorder ainda ativo, parando...');
          mediaRecorderRef.current.stop();
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      streamRef.current = stream;
      chunksRef.current = [];

      // Adicionar listeners para monitorar o stream
      stream.addEventListener('inactive', () => {
        console.warn('⚠️ Stream de áudio ficou inativo!', {
          timestamp: new Date().toISOString(),
          wasRecording: state.isRecording,
          streamId: stream.id,
          tracksCount: stream.getTracks().length
        });
        if (state.isRecording) {
          console.error('❌ Stream inativo durante gravação - forçando parada');
          stopRecording();
        }
      });

      stream.addEventListener('active', () => {
        console.log('✅ Stream de áudio ativo', {
          timestamp: new Date().toISOString(),
          streamId: stream.id
        });
      });

      // Verificar estado inicial do stream
      console.log('🔍 Estado inicial do stream:', {
        active: stream.active,
        id: stream.id,
        tracks: stream.getTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length
      });

      // Monitorar tracks de áudio
      const audioTracksForStream = stream.getAudioTracks();
      audioTracksForStream.forEach(track => {
        track.addEventListener('ended', () => {
          console.warn('⚠️ Track de áudio terminou:', track.label);
          if (state.isRecording) {
            console.error('❌ Track terminou durante gravação - forçando parada');
            stopRecording();
          }
        });

        track.addEventListener('mute', () => {
          console.warn('🔇 Track de áudio silenciado:', track.label);
        });

        track.addEventListener('unmute', () => {
          console.log('🔊 Track de áudio dessilenciado:', track.label);
        });
      });

      // Testar formatos suportados - priorizar OGG/Opus para compatibilidade com WhatsApp
      const formats = [
        'audio/ogg;codecs=opus',    // Prioridade máxima - formato nativo do WhatsApp
        'audio/ogg',                // OGG sem especificar codec
        'audio/webm;codecs=opus',   // WebM com Opus
        'audio/webm',               // WebM genérico
        'audio/mp4',                // MP4 como fallback
        'audio/wav'                 // WAV como último recurso
      ];

      let selectedFormat = '';
      for (const format of formats) {
        if (MediaRecorder.isTypeSupported(format)) {
          selectedFormat = format;
          console.log('✅ Formato selecionado:', format);
          break;
        } else {
          console.log('❌ Formato não suportado:', format);
        }
      }

      if (!selectedFormat) {
        console.log('⚠️ Nenhum formato específico suportado, usando padrão do navegador');
      }

      // Criar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, selectedFormat ? { mimeType: selectedFormat } : {});
      
      console.log('📹 MediaRecorder criado:', {
        mimeType: mediaRecorder.mimeType,
        state: mediaRecorder.state,
        audioBitsPerSecond: mediaRecorder.audioBitsPerSecond
      });
      
      mediaRecorderRef.current = mediaRecorder;

      // Event listeners
      mediaRecorder.ondataavailable = (event) => {
        console.log('📊 Dados disponíveis:', {
          size: event.data.size,
          type: event.data.type,
          timestamp: new Date().toISOString(),
          totalChunks: chunksRef.current.length,
          state: mediaRecorder.state
        });

        // Sempre adicionar o chunk, mesmo se for vazio (pode ser necessário para alguns formatos)
        chunksRef.current.push(event.data);

        // Log adicional se o chunk estiver vazio
        if (event.data.size === 0) {
          console.warn('⚠️ Chunk vazio recebido - isso pode ser normal no início da gravação');
        }
      };

      mediaRecorder.onstart = () => {
        console.log('🎙️ Gravação iniciada - MediaRecorder state:', mediaRecorder.state);
      };

      mediaRecorder.onpause = () => {
        console.log('⏸️ Gravação pausada - MediaRecorder state:', mediaRecorder.state);
      };

      mediaRecorder.onresume = () => {
        console.log('▶️ Gravação retomada - MediaRecorder state:', mediaRecorder.state);
      };

      mediaRecorder.onstop = () => {
        console.log('🛑 MediaRecorder.onstop chamado automaticamente! State:', mediaRecorder.state);
        console.log('🔍 Investigando motivo da parada automática...');

        // Verificar se o stream ainda está ativo
        const streamActive = streamRef.current?.active;
        const audioTracks = streamRef.current?.getAudioTracks();
        const trackStates = audioTracks?.map(track => ({
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState
        }));

        console.log('🔍 Estado do stream na parada:', {
          streamActive,
          audioTracks: audioTracks?.length,
          trackStates
        });

        // Erros são tratados pelo evento onerror, não por propriedade

        // Chamar o processamento normal
        // SOLUÇÃO: Aguardar um pouco mais e tentar coletar dados pendentes
        console.log('⏳ Aguardando processamento final dos chunks...');
        setTimeout(() => {
          const finalChunks = chunksRef.current;
          console.log('📊 Chunks finais após espera:', {
            totalChunks: finalChunks.length,
            chunkSizes: finalChunks.map(chunk => chunk.size),
            totalSize: finalChunks.reduce((sum, chunk) => sum + chunk.size, 0)
          });

          // Filtrar chunks com conteúdo (incluindo chunks muito pequenos)
          const validChunks = finalChunks.filter(chunk => chunk.size > 0);
          const totalSize = validChunks.reduce((sum, chunk) => sum + chunk.size, 0);

          console.log('📊 Chunks válidos:', {
            validChunks: validChunks.length,
            totalValidSize: totalSize
          });

          if (validChunks.length === 0 || totalSize === 0) {
            // TENTATIVA FINAL: Criar blob mesmo com dados mínimos se possível
            console.warn('⚠️ Tentando criar blob com todos os chunks disponíveis...');
            const allChunks = finalChunks.filter(chunk => chunk.size >= 0); // Aceitar até chunks vazios
            const fallbackSize = allChunks.reduce((sum, chunk) => sum + chunk.size, 0);

            if (allChunks.length > 0 && fallbackSize >= 0) {
              console.log('🔄 Criando blob com dados de fallback...');
              const finalMimeType = mediaRecorder.mimeType || selectedFormat || 'audio/webm';
              const audioBlob = new Blob(allChunks, { type: finalMimeType });

              console.log('🎵 Blob de áudio criado (fallback):', {
                size: audioBlob.size,
                type: audioBlob.type,
                chunksUsed: allChunks.length
              });

              if (audioBlob.size > 0) {
                const audioUrl = URL.createObjectURL(audioBlob);
                console.log('🔗 URL do áudio criada (fallback):', audioUrl);

                setState(prev => ({
                  ...prev,
                  isRecording: false,
                  isPaused: false,
                  isStopping: false,
                  audioBlob,
                  audioUrl,
                }));

                // Limpar stream
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach(track => track.stop());
                  streamRef.current = null;
                }
                return;
              }
            }

            console.error('❌ Falha completa na coleta de áudio. Possíveis causas:');
            console.error('   - Permissões de microfone revogadas durante gravação');
            console.error('   - Stream desconectado ou interrompido');
            console.error('   - Erro no MediaRecorder causando parada automática');
            console.error('   - Dispositivo de áudio desconectado');
            console.error('   - Timeout ou limite do navegador');

            setState(prev => ({
              ...prev,
              isRecording: false,
              isPaused: false,
              isStopping: false,
              audioBlob: null,
              audioUrl: null,
            }));

            // Limpar stream
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
            return;
          }

          // Usar o formato detectado pelo MediaRecorder ou fallback
          const finalMimeType = mediaRecorder.mimeType || selectedFormat || 'audio/webm';
          const audioBlob = new Blob(validChunks, { type: finalMimeType });

          console.log('🎵 Blob de áudio criado:', {
            size: audioBlob.size,
            type: audioBlob.type,
            chunksUsed: validChunks.length
          });

          if (audioBlob.size === 0) {
            console.error('❌ Blob criado está vazio!');
            setState(prev => ({
              ...prev,
              isRecording: false,
              isPaused: false,
              isStopping: false,
              audioBlob: null,
              audioUrl: null,
            }));

            // Limpar stream
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
            return;
          }

          const audioUrl = URL.createObjectURL(audioBlob);
          console.log('🔗 URL do áudio criada:', audioUrl);

          setState(prev => ({
            ...prev,
            isRecording: false,
            isPaused: false,
            isStopping: false,
            audioBlob,
            audioUrl,
          }));

          // Limpar stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }, 100); // Aguardar 100ms finais para processamento
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ Erro no MediaRecorder:', event);
        console.error('🔍 Detalhes do erro:', {
          error: (event as any).error,
          state: mediaRecorder.state,
          streamActive: streamRef.current?.active
        });
      };

      // Aguardar um momento para garantir que o stream está estável
      console.log('⏳ Aguardando estabilização do stream...');
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verificar novamente se o stream ainda está ativo
      console.log('🔍 Verificando stream antes de iniciar:', {
        active: stream.active,
        id: stream.id,
        tracksCount: stream.getTracks().length,
        audioTracksCount: stream.getAudioTracks().length
      });

      if (!stream.active) {
        console.error('❌ Stream não está ativo antes de iniciar gravação');
        throw new Error('Stream de áudio foi desativado antes de iniciar a gravação');
      }

      // Verificar se os tracks ainda estão ativos
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('Nenhum track de áudio disponível');
      }

      const inactiveTracks = audioTracks.filter(track => track.readyState !== 'live');
      if (inactiveTracks.length > 0) {
        console.warn('⚠️ Alguns tracks não estão ativos:', inactiveTracks.map(t => t.readyState));
      }

      // Iniciar gravação com intervalo menor para capturar dados mais frequentemente
      console.log('🚀 Iniciando gravação...');
      mediaRecorder.start(250); // Coleta dados a cada 250ms
      
      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
        audioBlob: null,
        audioUrl: null,
      }));

      startTimer();
      startHeartbeat();

      console.log('✅ Gravação iniciada com sucesso');

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      throw new Error('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  }, [startTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      stopTimer();
      setState(prev => ({
        ...prev,
        isPaused: true,
      }));
    }
  }, [state.isRecording, state.isPaused, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      startTimer();
      setState(prev => ({
        ...prev,
        isPaused: false,
      }));
    }
  }, [state.isRecording, state.isPaused, startTimer]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    stopTimer();

    setState({
      isRecording: false,
      isPaused: false,
      isStopping: false,
      recordingTime: 0,
      audioBlob: null,
      audioUrl: null,
      minimumRecordingTime: 1,
    });
  }, [stopTimer]);

  const recordForDuration = useCallback(async (durationSeconds: number = 3) => {
    console.log(`🎯 Iniciando gravação automática de ${durationSeconds} segundos...`);
    try {
      await startRecording();

      // Aguardar o tempo especificado
      await new Promise(resolve => setTimeout(resolve, durationSeconds * 1000));

      // Parar automaticamente
      console.log('⏰ Tempo limite atingido, parando automaticamente...');
      await stopRecording();

    } catch (error) {
      console.error('Erro na gravação automática:', error);
      throw error;
    }
  }, [startRecording, stopRecording]);

  const resetRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState({
      isRecording: false,
      isPaused: false,
      isStopping: false,
      recordingTime: 0,
      audioBlob: null,
      audioUrl: null,
      minimumRecordingTime: 1,
    });
  }, [state.audioUrl]);

  // Cleanup ao desmontar o componente
  const cleanup = useCallback(() => {
    console.log('🧹 Executando cleanup completo...');

    // Parar MediaRecorder se estiver ativo
    if (mediaRecorderRef.current) {
      const recorderState = mediaRecorderRef.current.state;
      console.log('📹 Parando MediaRecorder no cleanup, estado:', recorderState);

      if (recorderState !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.warn('⚠️ Erro ao parar MediaRecorder no cleanup:', error);
        }
      }
    }

    // Parar stream e tracks
    if (streamRef.current) {
      console.log('🔊 Parando tracks do stream no cleanup...');
      streamRef.current.getTracks().forEach(track => {
        console.log('🛑 Parando track:', track.label, track.kind);
        track.stop();
      });
      streamRef.current = null;
    }

    // Limpar URLs
    if (state.audioUrl) {
      console.log('🔗 Revogando URL de áudio no cleanup');
      URL.revokeObjectURL(state.audioUrl);
    }

    // Parar timers
    stopTimer();
    stopHeartbeat();

    console.log('✅ Cleanup completo');
  }, [state.audioUrl, stopTimer, stopHeartbeat]);

  const controls: AudioRecorderControls = {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    resetRecording,
    recordForDuration,
  };

  return {
    ...state,
    ...controls,
    cleanup,
  };
};
