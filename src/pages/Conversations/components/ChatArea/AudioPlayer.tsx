import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { useMarkAsPlayed, getSessionIdFromConversation } from '../../../../hooks/useReceipts';

interface AudioPlayerProps {
  audioUrl: string;
  isOutbound?: boolean;
  onError?: (error: any) => void;
  messageId?: string;
  conversation?: any;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  isOutbound = false,
  onError,
  messageId,
  conversation
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [playedReceiptSent, setPlayedReceiptSent] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Hook para enviar played receipt
  const { mutate: markAsPlayed } = useMarkAsPlayed();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => {
      // Enviar played receipt apenas uma vez por mensagem e apenas para mensagens recebidas
      if (!playedReceiptSent && !isOutbound && messageId && conversation) {
        const sessionId = getSessionIdFromConversation(conversation);
        
        console.log('🎵 Enviando played receipt para áudio:', {
          messageId,
          sessionId,
          audioUrl
        });

        markAsPlayed({
          messageId,
          sessionId
        });

        setPlayedReceiptSent(true);
      }
    };

    const handleError = (e: any) => {
      setIsLoading(false);
      onError?.(e);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('error', handleError);
    };
  }, [onError, playedReceiptSent, isOutbound, messageId, conversation, audioUrl, markAsPlayed]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border max-w-xs">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        disabled={isLoading}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isLoading 
            ? 'bg-gray-200 cursor-not-allowed' 
            : isOutbound
              ? 'bg-pink-500 hover:bg-pink-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      {/* Waveform/Progress Bar */}
      <div className="flex-1 flex flex-col space-y-1">
        <div 
          className="h-6 flex items-center cursor-pointer"
          onClick={handleProgressClick}
        >
          {/* Simulated waveform bars */}
          <div className="flex items-center space-x-0.5 w-full h-full">
            {Array.from({ length: 40 }, (_, i) => {
              const barHeight = Math.random() * 16 + 4; // Random height between 4-20px
              const isActive = (i / 40) * 100 <= getProgressPercentage();
              
              return (
                <div
                  key={i}
                  className={`w-0.5 rounded-full transition-colors ${
                    isActive 
                      ? isOutbound 
                        ? 'bg-pink-500' 
                        : 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                  style={{ height: `${barHeight}px` }}
                />
              );
            })}
          </div>
        </div>

        {/* Time Display */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Profile Picture Placeholder (similar to WhatsApp) */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};
