import { useEffect } from 'react';

const adsClient = 'ca-pub-2241216694217592';
const adsScriptId = 'google-adsense-loader';

function runWhenIdle(callback) {
  if (typeof window === 'undefined') return undefined;

  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: 3500 });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, 1800);
  return () => window.clearTimeout(id);
}

export default function ThirdPartyScripts() {
  useEffect(() => {
    const scheduleLoad = () => runWhenIdle(() => {
      if (document.getElementById(adsScriptId)) return;

      const script = document.createElement('script');
      script.id = adsScriptId;
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClient}`;
      document.head.appendChild(script);
    });

    if (document.readyState === 'complete') {
      return scheduleLoad();
    }

    let cancelIdle;
    const handleLoad = () => {
      cancelIdle = scheduleLoad();
    };

    window.addEventListener('load', handleLoad, { once: true });
    return () => {
      window.removeEventListener('load', handleLoad);
      if (cancelIdle) cancelIdle();
    };
  }, []);

  return null;
}
