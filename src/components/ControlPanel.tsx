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
        'fixed md:static bottom-0 left-0 right-0 glass-panel border-t border-gold/20 md:border-r md:border-t-0 md:w-[350px] max-h-[50vh] md:max-h-screen overflow-y-auto transition-transform duration-300 z-50',
        isCollapsed && 'translate-y-[calc(100%-60px)] md:translate-y-0'
      )}
    >
      {/* Mobile Header */}
      <div
        className="md:hidden flex justify-between items-center p-4 bg-black/10 backdrop-blur-md cursor-pointer border-b border-gold/25"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="gold-text text-base font-semibold drop-shadow-lg">⚙️ Controls</div>
        <ChevronDown
          className={cn(
            'w-6 h-6 transition-transform text-gold drop-shadow-lg',
            !isCollapsed && 'rotate-180'
          )}
        />
      </div>

      {/* Content */}
      <div className="p-5 md:p-8 space-y-6">
        {/* Chain Selection */}
        <div className="space-y-4">
          <h3 className="text-sm md:text-base font-semibold text-gold drop-shadow-lg">🔗 Select Chain</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:max-h-[250px] md:overflow-y-auto">
            {chains.map((chain, idx) => (
              <button
                key={idx}
                onClick={() => onSelectChain(idx)}
                className={cn(
                  'p-4 rounded-lg text-sm text-center transition-all border-2 text-white drop-shadow-lg',
                  idx === currentIndex
                    ? 'bg-gold/25 border-gold shadow-lg shadow-gold/30'
                    : 'bg-black/20 border-gold/30 hover:bg-gold/15'
                )}
              >
                {chain.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onPrevious}
              className="px-4 py-3 bg-black/15 hover:bg-gold/20 border border-gold/40 hover:border-gold/70 rounded-lg text-sm font-medium transition-all text-white drop-shadow-lg"
            >
              ← Previous
            </button>
            <button
              onClick={onNext}
              className="px-4 py-3 bg-black/15 hover:bg-gold/20 border border-gold/40 hover:border-gold/70 rounded-lg text-sm font-medium transition-all text-white drop-shadow-lg"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Adjustments */}
        <div className="space-y-4">
          <h3 className="text-sm md:text-base font-semibold text-gold drop-shadow-lg">⚙️ Adjustments</h3>

          {/* Chain Size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-white drop-shadow-lg">Chain Size</span>
              <span className="text-gold font-semibold drop-shadow-lg">{Math.round(chainScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.05"
              value={chainScale}
              onChange={(e) => onChainScaleChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:gradient-neon [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/50"
            />
          </div>

          {/* Vertical Position */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-white drop-shadow-lg">Vertical Position</span>
              <span className="text-gold font-semibold drop-shadow-lg">{verticalOffset.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-0.3"
              max="0.5"
              step="0.05"
              value={verticalOffset}
              onChange={(e) => onVerticalOffsetChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:gradient-neon [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
