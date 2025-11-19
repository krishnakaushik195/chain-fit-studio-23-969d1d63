import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuickActionsProps {
  onPrevious: () => void;
  onNext: () => void;
}

export const QuickActions = ({ onPrevious, onNext }: QuickActionsProps) => {
  return (
    <div className="fixed right-4 top-4 md:hidden flex flex-col gap-3 z-40">
      <button
        onClick={onPrevious}
        className="w-12 h-12 rounded-full bg-gold border-2 border-gold flex items-center justify-center hover:bg-gold/80 active:scale-90 transition-all"
        aria-label="Previous chain"
      >
        <ChevronLeft className="w-6 h-6 text-black" />
      </button>
      <button
        onClick={onNext}
        className="w-12 h-12 rounded-full bg-gold border-2 border-gold flex items-center justify-center hover:bg-gold/80 active:scale-90 transition-all"
        aria-label="Next chain"
      >
        <ChevronRight className="w-6 h-6 text-black" />
      </button>
    </div>
  );
};
