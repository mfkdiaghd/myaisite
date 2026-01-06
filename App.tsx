
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import SettingsModal from './components/SettingsModal';
import { ChatMode } from './types';
import { setupNetworkInterceptor } from './utils/network';

const App: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>(ChatMode.TEXT);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [proxyHost, setProxyHost] = useState(localStorage.getItem('gemini_proxy_host') || '');

  // 应用代理拦截
  useEffect(() => {
    if (proxyHost) {
      setupNetworkInterceptor(proxyHost);
    }
  }, [proxyHost]);

  const handleSaveProxy = (newProxy: string) => {
    const cleanProxy = newProxy.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    setProxyHost(cleanProxy);
    localStorage.setItem('gemini_proxy_host', cleanProxy);
    // 重启应用以确保所有 SDK 实例应用新设置
    window.location.reload(); 
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden selection:bg-indigo-500/30">
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="flex-1 mt-16 flex flex-col overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-64 bg-indigo-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/5 blur-[100px] rounded-full -z-10 pointer-events-none" />
        
        {/* Mode Switcher */}
        <div className="flex justify-center p-6 shrink-0 relative">
          <div className="bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 flex shadow-2xl backdrop-blur-sm">
            <button
              onClick={() => setMode(ChatMode.TEXT)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                mode === ChatMode.TEXT 
                  ? 'bg-zinc-800 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              文字模式
            </button>
            <button
              onClick={() => setMode(ChatMode.VOICE)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                mode === ChatMode.VOICE 
                  ? 'bg-zinc-800 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
              </svg>
              语音模式
            </button>
          </div>

          {/* Proxy status floating badge */}
          {proxyHost && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">免翻墙模式已启用</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {mode === ChatMode.TEXT ? (
            <ChatInterface />
          ) : (
            <VoiceInterface />
          )}
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentProxy={proxyHost}
        onSave={handleSaveProxy}
      />

      {/* Footer Info */}
      <footer className="h-12 border-t border-zinc-900 bg-zinc-950 flex items-center justify-center shrink-0">
        <div className="flex items-center gap-6">
          <p className="text-[10px] text-zinc-700 tracking-[0.2em] uppercase font-bold">
            Gemini Core Powered
          </p>
          <div className="h-3 w-[1px] bg-zinc-800" />
          <p className="text-[10px] text-zinc-500 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            Secure & Private Interaction
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
