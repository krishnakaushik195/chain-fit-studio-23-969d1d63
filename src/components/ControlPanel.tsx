import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Chain {
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
}: ControlPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div
      className={cn(
        'fixed md:static bottom-0 left-0 right-0 glass-panel border-t border-gold/20 md:border-r md:border-t-0 md:w-[350px] max-h-[35vh] md:max-h-screen overflow-y-auto transition-transform duration-300 z-50',
        isCollapsed && 'translate-y-[calc(100%-56px)] md:translate-y-0'
      )}
    >
      {/* Mobile Header */}
      <div
        className={cn(
          "md:hidden flex justify-center items-center cursor-pointer",
          isCollapsed 
            ? "bg-gold text-black px-6 py-2 rounded-sm mx-auto my-2 w-fit shadow-lg" 
            : "bg-transparent border-gold/20 text-white p-4 border-b w-full"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className={cn(
          "text-sm font-semibold",
          !isCollapsed && "drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
        )}>
          Controls
        </div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-8 space-y-6">
        {/* Adjustments */}
        <div className="space-y-4">
          <h3 className="text-sm md:text-base font-semibold text-gold drop-shadow-[0_0_10px_rgba(212,175,55,1)]">Adjustments</h3>

          {/* Chain Size */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="text-gold font-semibold drop-shadow-[0_0_10px_rgba(212,175,55,1)]">{Math.round(chainScale * 100)}%</span>
              <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">Chain Size</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.05"
              value={chainScale}
              onChange={(e) => onChainScaleChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
            />
          </div>

          {/* Vertical Position */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="text-gold font-semibold drop-shadow-[0_0_10px_rgba(212,175,55,1)]">{verticalOffset.toFixed(2)}</span>
              <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">Vertical Position</span>
            </div>
            <input
              type="range"
              min="-0.3"
              max="0.5"
              step="0.05"
              value={verticalOffset}
              onChange={(e) => onVerticalOffsetChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
            />
          </div>
        </div>

        {/* Chain Selection */}
        <div className="space-y-4">
          <h3 className="text-sm md:text-base font-semibold text-gold drop-shadow-[0_0_10px_rgba(212,175,55,1)]">Select Chain</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:max-h-[250px] md:overflow-y-auto">
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

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onPrevious}
              className="px-4 py-3 bg-transparent hover:bg-gold/20 border-2 border-gold/60 hover:border-gold rounded-lg text-sm font-medium transition-all text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            >
              ← Previous
            </button>
            <button
              onClick={onNext}
              className="px-4 py-3 bg-transparent hover:bg-gold/20 border-2 border-gold/60 hover:border-gold rounded-lg text-sm font-medium transition-all text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
