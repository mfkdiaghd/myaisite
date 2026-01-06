
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../utils/audio';

const VoiceInterface: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<string>('等待连接...');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micStreamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsActive(false);
    setStatus('已断开');
  }, []);

  const toggleConnection = async () => {
    if (isActive) {
      cleanup();
      return;
    }

    try {
      setStatus('正在初始化...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Setup audio contexts
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (!inputContextRef.current) {
        inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('实时通话已开启');
            setIsActive(true);
            
            // Start streaming mic audio
            const source = inputContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (sessionRef.current) {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionRef.current.sendRealtimeInput({ media: pcmBlob });
              }
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
              setIsSpeaking(true);
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error('Live error:', e);
            setStatus('发生错误');
            cleanup();
          },
          onclose: () => {
            setStatus('已关闭');
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: '你是一个充满活力、友好且乐于助人的中文语音助手。保持回答简洁，适合语音交流。',
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error('Failed to connect:', error);
      setStatus('无法访问麦克风');
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 space-y-12">
      <div className="relative flex items-center justify-center">
        {/* Animated Rings */}
        <div className={`absolute w-64 h-64 rounded-full border border-indigo-500/20 ${isActive ? 'animate-ping' : 'hidden'}`} />
        <div className={`absolute w-48 h-48 rounded-full border border-indigo-500/40 ${isSpeaking ? 'animate-[pulse_1.5s_infinite]' : 'hidden'}`} />
        
        {/* Main Mic Button */}
        <button
          onClick={toggleConnection}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all transform active:scale-95 ${
            isActive 
              ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_30px_rgba(220,38,38,0.4)]' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_30px_rgba(79,70,229,0.4)]'
          }`}
        >
          {isActive ? (
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
            </svg>
          )}
        </button>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-100">
          {isActive ? (isSpeaking ? 'Gemini 正在说话...' : '我在听，请说话') : '语音实时通话'}
        </h2>
        <p className={`text-sm ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`}>
          {status}
        </p>
        {!isActive && (
          <p className="text-zinc-400 max-w-xs mx-auto">
            点击按钮开启实时语音对话。基于 Gemini 2.5 Live API，享受极低延迟的语音交互。
          </p>
        )}
      </div>

      {isActive && (
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 bg-indigo-500 rounded-full transition-all duration-150 ${
                isSpeaking ? 'h-8' : 'h-2'
              }`}
              style={{
                animationDelay: `${i * 0.1}s`,
                height: isSpeaking ? `${16 + Math.random() * 24}px` : '8px'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;
