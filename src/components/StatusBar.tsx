interface StatusBarProps {
  status: string;
  isActive: boolean;
}

export const StatusBar = ({ status, isActive }: StatusBarProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 glass-panel border-b border-gold/20 px-5 py-3 flex justify-between items-center z-40">
      <div className="text-xs md:text-sm text-gold font-medium">
        {status}
      </div>
      <div 
        className={`w-2 h-2 rounded-full ${isActive ? 'bg-gold pulse-glow' : 'bg-muted'}`} 
      />
    </div>
  );
};
