const Ornament = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
    <span className="h-px w-12 bg-current opacity-50" />
    <svg viewBox="0 0 80 16" className="h-4 w-9" fill="none">
      <path d="M8 8 Q20 0 40 8 Q60 16 72 8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="40" cy="8" r="3" fill="currentColor" />
    </svg>
    <span className="h-px w-12 bg-current opacity-50" />
  </div>
);
export default Ornament;
