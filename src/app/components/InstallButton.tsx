'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      console.log('✅ beforeinstallprompt 事件触发');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setDebugInfo('可以安装');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 检查是否已经安装
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstallable(false);
      setDebugInfo('已安装');
      console.log('ℹ️ 应用已安装');
    } else {
      setDebugInfo('等待安装提示...');
      console.log('ℹ️ 等待 beforeinstallprompt 事件');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('用户接受了安装');
    } else {
      console.log('用户拒绝了安装');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // 开发模式：显示调试信息
  if (!isInstallable) {
    return (
      <div className="block w-full bg-gray-500/50 rounded-2xl p-4 text-white text-center text-sm">
        💡 {debugInfo}
        <div className="text-xs mt-1 opacity-75">
          {debugInfo === '已安装' ? '应用已添加到主屏幕' : '在支持的浏览器中访问以显示安装按钮'}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white text-center font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
    >
      📱 安装到桌面
    </button>
  );
}
