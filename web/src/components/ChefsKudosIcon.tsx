import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChefsKudosIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { box: 'h-8 w-8', icon: 'w-4 h-4' },
  md: { box: 'h-10 w-10', icon: 'w-5 h-5' },
  lg: { box: 'h-12 w-12', icon: 'w-6 h-6' },
};

/** Soft amber circle with star — Chef's Kudos branding */
export function ChefsKudosIcon({ className, size = 'md' }: ChefsKudosIconProps) {
  const { box, icon } = sizeMap[size];
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-amber-100',
        box,
        className
      )}
      aria-hidden
    >
      <Star className={cn(icon, 'fill-amber-400 text-amber-600')} strokeWidth={2} />
    </div>
  );
}

