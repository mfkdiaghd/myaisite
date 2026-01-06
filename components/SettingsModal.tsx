
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProxy: string;
  onSave: (proxy: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentProxy, onSave }) => {
  const [proxy, setProxy] = useState(currentProxy);

  if (!isOpen) return null;

  const quickProxies = [
    { label: '默认直连', value: '' },
    { label: '公益代理 1', value: 'gemini.chat-proxy.com' },
    { label: '公益代理 2', value: 'api.gemini-proxy.top' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/10 rounded-lg">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </span>
            网络连接优化
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">API 代理主机地址</label>
            <input
              type="text"
              value={proxy}
              onChange={(e) => setProxy(e.target.value)}
              placeholder="例如: proxy.example.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3">快速预设 (推荐国内用户)</label>
            <div className="grid grid-cols-1 gap-2">
              {quickProxies.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProxy(p.value)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm ${
                    proxy === p.value 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="text-xs opacity-60 font-mono">{p.value || 'direct'}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-zinc-500 leading-relaxed bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
              提示：设置代理后，应用会将请求发送至代理服务器，绕过网络封锁。建议使用您自己部署的反向代理以获得最稳定的体验。
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-bold"
          >
            取消
          </button>
          <button
            onClick={() => {
              onSave(proxy);
              onClose();
            }}
            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-bold shadow-lg shadow-indigo-600/20"
          >
            保存并刷新
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
