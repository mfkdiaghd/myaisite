
/**
 * 拦截全局 fetch 和 WebSocket 请求，将 Google API 流量转发至代理服务器
 */
export const setupNetworkInterceptor = (proxyHost: string) => {
  if (!proxyHost) return;

  const targetDomain = 'generativelanguage.googleapis.com';
  // 去除可能的 http 协议头和末尾斜杠
  const cleanProxy = proxyHost.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

  // 1. 拦截 fetch (用于文字聊天、图片生成等)
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
    
    if (url.includes(targetDomain)) {
      const newUrl = url.replace(targetDomain, cleanProxy);
      console.log(`[Network Interceptor] Fetching via proxy: ${newUrl}`);
      
      if (input instanceof Request) {
        // 克隆原始请求并修改 URL
        const { url: _, ...rest } = input;
        const newRequest = new Request(newUrl, {
          method: input.method,
          headers: input.headers,
          body: input.body,
          referrer: input.referrer,
          integrity: input.integrity,
          mode: input.mode,
          credentials: input.credentials,
          cache: input.cache,
          redirect: input.redirect,
        });
        return originalFetch(newRequest, init);
      }
      return originalFetch(newUrl, init);
    }
    return originalFetch(input, init);
  };

  // 2. 拦截 WebSocket (用于 Gemini Live 语音接口)
  const OriginalWebSocket = window.WebSocket;
  // @ts-ignore
  window.WebSocket = function(url: string, protocols?: string | string[]) {
    if (url.includes(targetDomain)) {
      const newUrl = url.replace(targetDomain, cleanProxy);
      console.log(`[Network Interceptor] WebSocket via proxy: ${newUrl}`);
      return new OriginalWebSocket(newUrl, protocols);
    }
    return new OriginalWebSocket(url, protocols);
  };
  
  // 保持 WebSocket 静态属性一致
  Object.setPrototypeOf(window.WebSocket, OriginalWebSocket);
  window.WebSocket.prototype = OriginalWebSocket.prototype;
  // @ts-ignore
  window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
  // @ts-ignore
  window.WebSocket.OPEN = OriginalWebSocket.OPEN;
  // @ts-ignore
  window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
  // @ts-ignore
  window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;
};
