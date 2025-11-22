import { useEffect, useState, useCallback } from 'react';
import { VideoCanvas } from '@/components/VideoCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { StatusBar } from '@/components/StatusBar';
import { QuickActions } from '@/components/QuickActions';
import { toast } from 'sonner';

interface Chain {
  name: string;
  data: string; // direct Google Drive image URL
}

// =========================
// LOCAL CHAIN IMAGES
// =========================
const LOCAL_CHAINS: Chain[] = [
  {
    name: 'Chain 1',
    data: '/chains/chain-1.png'
  },
  {
    name: 'Chain 2',
    data: '/chains/chain-2.png'
  },
  // Add all remaining 38 images here (chain-3.png, chain-4.png, etc.)
];

const Index = () => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chainScale, setChainScale] = useState(1.0);
  const [verticalOffset, setVerticalOffset] = useState(-0.20);

  const [isLoading, setIsLoading] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Load chains from local folder
  useEffect(() => {
    setChains(LOCAL_CHAINS);
    setIsLoading(false);
    toast.success(`Loaded ${LOCAL_CHAINS.length} chains`);
  }, []);

  const selectChain = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const previousChain = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + chains.length) % chains.length);
  }, [chains.length]);

  const nextChain = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % chains.length);
  }, [chains.length]);

  // Take screenshot from camera
  const handleScreenshot = useCallback(() => {
    const video = document.querySelector('video');
    const canvas = document.createElement('canvas');

    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `chain-fit-${Date.now()}.png`;
          a.click();

          URL.revokeObjectURL(url);
          toast.success('Screenshot saved!');
        });
      }
    }
  }, []);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') previousChain();
      if (e.key === 'ArrowRight') nextChain();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousChain, nextChain]);

  const currentChain = chains[currentIndex] || null;

  const statusText =
    isCameraReady && currentChain
      ? `🟢 ${currentChain.name}`
      : isLoading
      ? "Loading chains..."
      : "Initializing camera...";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      <StatusBar status={statusText} isActive={isCameraReady} />

      <ControlPanel
        chains={chains}
        currentIndex={currentIndex}
        onSelectChain={selectChain}
        chainScale={chainScale}
        onChainScaleChange={setChainScale}
        verticalOffset={verticalOffset}
        onVerticalOffsetChange={setVerticalOffset}
        onPrevious={previousChain}
        onNext={nextChain}
        onScreenshot={handleScreenshot}
      />

      <VideoCanvas
        currentChain={currentChain}
        chainScale={chainScale}
        verticalOffset={verticalOffset}
        onCameraReady={() => setIsCameraReady(true)}
      />

      <QuickActions onPrevious={previousChain} onNext={nextChain} />

      {/* Powered By Footer */}
      <div className="fixed top-20 right-4 bg-gold/10 backdrop-blur-sm border border-gold/20 rounded-lg px-3 py-2 text-center z-30">
        <p className="text-[10px] md:text-xs gold-text font-medium">
          Powered by Sai Ram Jewelers
        </p>
        <p className="text-[9px] md:text-[10px] text-gold/80 mt-0.5">
          +91 7207418556
        </p>
      </div>
    </div>
  );
};

export default Index;
