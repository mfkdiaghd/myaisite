
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: '你好！我是 Gemini AI，很高兴为你服务。你可以向我提问、让我写作或进行创意讨论。\n\n💡 如果你发现无法收到回复，请点击右上角齿轮图标配置网络代理。', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setNetworkError(false);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: '你是一个友好且博学的AI助手，使用中文回答。',
        },
      });

      const response = await chat.sendMessageStream({ message: input });
      
      const assistantId = (Date.now() + 1).toString();
      let assistantContent = '';
      
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of response) {
        const text = (chunk as GenerateContentResponse).text;
        if (text) {
          assistantContent += text;
          setMessages(prev => prev.map(m => 
            m.id === assistantId ? { ...m, content: assistantContent } : m
          ));
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const isNetworkIssue = error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError');
      if (isNetworkIssue) setNetworkError(true);
      
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: isNetworkIssue 
          ? '❌ 无法连接到 AI 服务。检测到网络受阻，请点击右上角“网络设置”配置代理。' 
          : '抱歉，我现在遇到了一些问题。请稍后再试。',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto pt-4">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700'
            }`}>
              <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                {msg.content}
                {isLoading && msg.role === 'assistant' && msg.content === '' && (
                  <span className="inline-block w-1 h-4 ml-1 bg-zinc-400 animate-pulse" />
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        {networkError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-bounce">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            连接失败，建议开启“免翻墙模式”。
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入您的问题..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-4 pl-4 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-100 placeholder:text-zinc-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-zinc-600 mt-2">
          Gemini 可能会产生不准确的信息，请核实重要回复。
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
