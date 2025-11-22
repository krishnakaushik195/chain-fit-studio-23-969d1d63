import { useState } from 'react';
import { ChevronDown, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Chain {
  name: string;
  data: string;
}

interface Earring {
  name: string;
  data: string;
}

interface ControlPanelProps {
  chains: Chain[];
  currentIndex: number;
  onSelectChain: (index: number) => void;
  chainScale: number;
  onChainScaleChange: (value: number) => void;
  verticalOffset: number;
  onVerticalOffsetChange: (value: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onScreenshot: () => void;
  earrings: Earring[];
  currentEarringIndex: number;
  onSelectEarring: (index: number) => void;
  earringScale: number;
  onEarringScaleChange: (value: number) => void;
  onPreviousEarring: () => void;
  onNextEarring: () => void;
  showEarrings: boolean;
  onToggleMode: (show: boolean) => void;
}

export const ControlPanel = ({
  chains,
  currentIndex,
  onSelectChain,
  chainScale,
  onChainScaleChange,
  verticalOffset,
  onVerticalOffsetChange,
  onPrevious,
  onNext,
  onScreenshot,
  earrings,
  currentEarringIndex,
  onSelectEarring,
  earringScale,
  onEarringScaleChange,
  onPreviousEarring,
  onNextEarring,
  showEarrings,
  onToggleMode,
}: ControlPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      {/* Floating Action Buttons - Mobile Only */}
      <div className={cn(
        "fixed left-1/2 -translate-x-1/2 flex items-center gap-3 z-50 md:hidden transition-all duration-300",
        isCollapsed ? "bottom-4" : "bottom-[37vh]"
      )}>
        <button
          onClick={onScreenshot}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            isCollapsed 
              ? "bg-gold hover:bg-gold/80 shadow-lg shadow-gold/60" 
              : "bg-gold/20 backdrop-blur-none border-2 border-gold/50 hover:border-gold active:scale-90"
          )}
          aria-label="Take screenshot"
        >
          <Camera className={cn("w-6 h-6", isCollapsed ? "text-black" : "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]")} />
        </button>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "px-6 py-2 rounded-lg transition-all text-base font-semibold",
            isCollapsed
              ? "bg-gold text-black shadow-lg shadow-gold/60 hover:bg-gold/80"
              : "bg-gold/20 backdrop-blur-none border-2 border-gold/50 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] hover:border-gold"
          )}
        >
          Controls
        </button>
      </div>

      {/* Control Panel */}
      <div
        className={cn(
          'fixed md:static bottom-0 left-0 right-0 bg-gold/5 border-t border-gold/20 md:border-r md:border-t-0 md:w-[350px] max-h-[35vh] md:max-h-screen overflow-y-auto transition-transform duration-300 z-40 overscroll-contain select-none',
          isCollapsed && 'translate-y-full md:translate-y-0'
        )}
      >
        {/* Desktop Header */}
        <div
          className="hidden md:flex cursor-pointer bg-transparent text-white p-4 border-b border-gold/20 justify-between"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="text-base font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
            Controls
          </div>
          <ChevronDown className={cn(
            "w-6 h-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-transform",
            isCollapsed && "rotate-180"
          )} />
        </div>

      {/* Content */}
      <div className="p-5 md:p-8 space-y-6 flex flex-col max-h-full">
        {/* Mode Toggle */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onToggleMode(false)}
            className={cn(
              'flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all border-2',
              !showEarrings
                ? 'bg-gold/30 border-gold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                : 'bg-transparent border-gold/50 text-white/70 hover:border-gold/80'
            )}
          >
            Chains
          </button>
          <button
            onClick={() => onToggleMode(true)}
            className={cn(
              'flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all border-2',
              showEarrings
                ? 'bg-gold/30 border-gold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                : 'bg-transparent border-gold/50 text-white/70 hover:border-gold/80'
            )}
          >
            Earrings
          </button>
        </div>

        {/* Adjustments */}
        <div className="space-y-4 flex-shrink-0">
          <h3 className="text-sm md:text-base font-semibold text-gold drop-shadow-[0_0_10px_rgba(212,175,55,1)]">
            Adjustments
          </h3>

          {!showEarrings ? (
            <>
              {/* Chain Size */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span className="text-gold font-semibold drop-shadow-[0_0_10px_rgba(212,175,55,1)]">
                    {Math.round(chainScale * 100)}%
                  </span>
                  <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                    Chain Size
                  </span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.05"
                  value={chainScale}
                  onChange={(e) => onChainScaleChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer touch-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
                />
              </div>

              {/* Vertical Position */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span className="text-gold font-semibold drop-shadow-[0_0_10px_rgba(212,175,55,1)]">
                    {verticalOffset.toFixed(2)}
                  </span>
                  <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                    Vertical Position
                  </span>
                </div>
                <input
                  type="range"
                  min="-0.3"
                  max="0.5"
                  step="0.05"
                  value={verticalOffset}
                  onChange={(e) => onVerticalOffsetChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer touch-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
                />
              </div>
            </>
          ) : (
            <>
              {/* Earring Size */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span className="text-gold font-semibold drop-shadow-[0_0_10px_rgba(212,175,55,1)]">
                    {Math.round(earringScale * 100)}%
                  </span>
                  <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                    Earring Size
                  </span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.05"
                  value={earringScale}
                  onChange={(e) => onEarringScaleChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer touch-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
                />
              </div>
            </>
          )}
        </div>

        {/* Item Selection */}
        <div className="space-y-4 flex-shrink-0 flex flex-col min-h-0">
          <h3 className="text-sm md:text-base font-semibold text-gold drop-shadow-[0_0_10px_rgba(212,175,55,1)]">
            {showEarrings ? 'Select Earring' : 'Select Chain'}
          </h3>

          {!showEarrings ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 overflow-y-auto overscroll-contain scrollbar-hide">
                {chains.map((chain, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectChain(idx)}
                    className={cn(
                      'p-4 rounded-lg text-sm text-center transition-all border-2 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]',
                      idx === currentIndex
                        ? 'bg-gold/30 border-gold border-[3px] shadow-lg shadow-gold/50'
                        : 'bg-transparent border-gold/50 hover:bg-gold/10 hover:border-gold'
                    )}
                  >
                    {chain.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-8 mt-4">
                <button
                  onClick={onPrevious}
                  className="w-16 h-16 bg-gold/20 hover:bg-gold/30 border-2 border-gold rounded-full flex items-center justify-center transition-all active:scale-90"
                  aria-label="Previous chain"
                >
                  <ChevronLeft className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                </button>
                <button
                  onClick={onNext}
                  className="w-16 h-16 bg-gold/20 hover:bg-gold/30 border-2 border-gold rounded-full flex items-center justify-center transition-all active:scale-90"
                  aria-label="Next chain"
                >
                  <ChevronRight className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 overflow-y-auto overscroll-contain scrollbar-hide">
                {earrings.length > 0 ? (
                  earrings.map((earring, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectEarring(idx)}
                      className={cn(
                        'p-4 rounded-lg text-sm text-center transition-all border-2 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]',
                        idx === currentEarringIndex
                          ? 'bg-gold/30 border-gold border-[3px] shadow-lg shadow-gold/50'
                          : 'bg-transparent border-gold/50 hover:bg-gold/10 hover:border-gold'
                      )}
                    >
                      {earring.name}
                    </button>
                  ))
                ) : (
                  <p className="text-white/70 text-sm col-span-2 text-center p-4">
                    No earrings found. Add images to public/earrings/ folder.
                  </p>
                )}
              </div>

              {earrings.length > 0 && (
                <div className="flex items-center justify-center gap-8 mt-4">
                  <button
                    onClick={onPreviousEarring}
                    className="w-16 h-16 bg-gold/20 hover:bg-gold/30 border-2 border-gold rounded-full flex items-center justify-center transition-all active:scale-90"
                    aria-label="Previous earring"
                  >
                    <ChevronLeft className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                  </button>
                  <button
                    onClick={onNextEarring}
                    className="w-16 h-16 bg-gold/20 hover:bg-gold/30 border-2 border-gold rounded-full flex items-center justify-center transition-all active:scale-90"
                    aria-label="Next earring"
                  >
                    <ChevronRight className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
};