import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ text, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
