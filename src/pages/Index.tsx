import { useEffect, useState, useCallback } from 'react';
import { VideoCanvas } from '@/components/VideoCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { StatusBar } from '@/components/StatusBar';
import { QuickActions } from '@/components/QuickActions';
import { toast } from 'sonner';

interface Chain {
  name: string;
  data: string;
}

interface Earring {
  name: string;
  data: string;
}

// =========================
// AUTO-LOAD CHAIN IMAGES
// =========================
// Automatically import all images from public/chains folder
const chainImages = import.meta.glob('/public/chains/*.(png|jpg|jpeg|webp)', { eager: true, as: 'url' });

// Generate chain list from imported images
const AUTO_CHAINS: Chain[] = Object.keys(chainImages)
  .sort() // Sort alphabetically
  .map((path, index) => {
    const filename = path.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || `Chain ${index + 1}`;
    return {
      name: filename.charAt(0).toUpperCase() + filename.slice(1), // Capitalize first letter
      data: path.replace('/public', '') // Convert to public URL path
    };
  });

// =========================
// AUTO-LOAD EARRING IMAGES
// =========================
const earringImages = import.meta.glob('/public/earrings/*.(png|jpg|jpeg|webp)', { eager: true, as: 'url' });

const AUTO_EARRINGS: Earring[] = Object.keys(earringImages)
  .sort()
  .map((path, index) => {
    const filename = path.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || `Earring ${index + 1}`;
    return {
      name: filename.charAt(0).toUpperCase() + filename.slice(1),
      data: path.replace('/public', '')
    };
  });

const Index = () => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chainScale, setChainScale] = useState(1.0);
  const [verticalOffset, setVerticalOffset] = useState(-0.20);

  const [earrings, setEarrings] = useState<Earring[]>([]);
  const [currentEarringIndex, setCurrentEarringIndex] = useState(0);
  const [earringScale, setEarringScale] = useState(1.0);
  const [earringHorizontalOffset, setEarringHorizontalOffset] = useState(0);
  const [earringVerticalOffset, setEarringVerticalOffset] = useState(0);
  const [earringDepthOffset, setEarringDepthOffset] = useState(0);
  const [showEarrings, setShowEarrings] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Load chains and earrings automatically from folders
  useEffect(() => {
    setChains(AUTO_CHAINS);
    setEarrings(AUTO_EARRINGS);
    setIsLoading(false);
    toast.success(`Loaded ${AUTO_CHAINS.length} chains and ${AUTO_EARRINGS.length} earrings`);
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

  const selectEarring = useCallback((index: number) => {
    setCurrentEarringIndex(index);
  }, []);

  const previousEarring = useCallback(() => {
    setCurrentEarringIndex((prev) => (prev - 1 + earrings.length) % earrings.length);
  }, [earrings.length]);

  const nextEarring = useCallback(() => {
    setCurrentEarringIndex((prev) => (prev + 1) % earrings.length);
  }, [earrings.length]);

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
  const currentEarring = earrings[currentEarringIndex] || null;

  const statusText =
    isCameraReady && currentChain
      ? `🟢 ${showEarrings ? currentEarring?.name || 'No Earring' : currentChain.name}`
      : isLoading
      ? "Loading..."
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
        earrings={earrings}
        currentEarringIndex={currentEarringIndex}
        onSelectEarring={selectEarring}
        earringScale={earringScale}
        onEarringScaleChange={setEarringScale}
        earringHorizontalOffset={earringHorizontalOffset}
        onEarringHorizontalOffsetChange={setEarringHorizontalOffset}
        earringVerticalOffset={earringVerticalOffset}
        onEarringVerticalOffsetChange={setEarringVerticalOffset}
        earringDepthOffset={earringDepthOffset}
        onEarringDepthOffsetChange={setEarringDepthOffset}
        onPreviousEarring={previousEarring}
        onNextEarring={nextEarring}
        showEarrings={showEarrings}
        onToggleMode={setShowEarrings}
      />

      <VideoCanvas
        currentChain={currentChain}
        chainScale={chainScale}
        verticalOffset={verticalOffset}
        currentEarring={currentEarring}
        earringScale={earringScale}
        earringHorizontalOffset={earringHorizontalOffset}
        earringVerticalOffset={earringVerticalOffset}
        earringDepthOffset={earringDepthOffset}
        showEarrings={showEarrings}
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
