import { useState, useEffect } from 'react';
import { X, Share, Download } from 'lucide-react';

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                            // @ts-ignore
                            window.navigator.standalone === true;
    setIsStandalone(isAppStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isAppStandalone) {
        const hasDismissed = localStorage.getItem('installPromptDismissed');
        if (!hasDismissed) {
          setShowPrompt(true);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (isIOSDevice && !isAppStandalone) {
      const hasDismissed = localStorage.getItem('installPromptDismissed');
      if (!hasDismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  if (!showPrompt || isStandalone) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 p-4 bg-surface/90 backdrop-blur border border-border rounded-2xl shadow-2xl flex flex-col gap-3 md:left-auto md:w-80">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-text font-medium mb-1">Instalar App</h3>
          {isIOS ? (
            <p className="text-sm text-text-muted">
              Añade Gym AI a tu inicio. Toca el icono de <Share className="inline w-4 h-4 mx-1" /> y selecciona <span className="font-medium text-text">Agregar a Inicio</span>.
            </p>
          ) : (
            <p className="text-sm text-text-muted">
              Instala Gym AI para una experiencia más rápida y fluida sin internet.
            </p>
          )}
        </div>
        <button onClick={dismiss} className="text-text-muted hover:text-text mt-1 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
      {!isIOS && deferredPrompt && (
        <button 
          onClick={handleInstallClick}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-2 font-medium flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar App
        </button>
      )}
    </div>
  );
}
