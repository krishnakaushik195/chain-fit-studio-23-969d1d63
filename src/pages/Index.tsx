import { useEffect, useState, useCallback } from 'react';
import { VideoCanvas } from '@/components/VideoCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { StatusBar } from '@/components/StatusBar';
import { QuickActions } from '@/components/QuickActions';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';

interface Chain {
  name: string;
  data: string;
}

const Index = () => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chainScale, setChainScale] = useState(1.0);
  const [verticalOffset, setVerticalOffset] = useState(-0.20);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Fetch chains from Flask backend
  useEffect(() => {
    const fetchChains = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.chains);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setChains(data);
          toast.success(`Loaded ${data.length} chains`);
        } else {
          toast.error('No chains found');
        }
      } catch (error) {
        console.error('Error loading chains:', error);
        toast.error('Failed to load chains. Make sure Flask backend is running.');
        
        // Fallback mock data for development
        setChains([
          { name: 'Gold Chain', data: '/placeholder.svg' },
          { name: 'Silver Chain', data: '/placeholder.svg' },
          { name: 'Diamond Chain', data: '/placeholder.svg' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChains();
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
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chain-fit-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Screenshot saved!');
          }
        });
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') previousChain();
      if (e.key === 'ArrowRight') nextChain();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousChain, nextChain]);

  const currentChain = chains[currentIndex] || null;
  const statusText = isCameraReady && currentChain
    ? `🟢 ${currentChain.name}`
    : isLoading
    ? 'Loading chains...'
    : 'Click Start Camera';

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
    </div>
  );
};

export default Index;
