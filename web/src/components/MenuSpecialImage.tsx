'use client';

import { useEffect, useState } from 'react';
import { Loader2, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuSpecialImageProps {
  src?: string;
  alt: string;
  className?: string;
  size?: 'card' | 'card-row' | 'verdict';
  loading?: boolean;
}

export function MenuSpecialImage({
  src,
  alt,
  className,
  size = 'card',
  loading = false,
}: MenuSpecialImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const layout =
    size === 'verdict'
      ? { width: 'w-full max-w-md mx-auto', aspect: 'aspect-[16/10]' }
      : size === 'card-row'
        ? { width: 'w-28 sm:w-32 shrink-0', aspect: 'aspect-square' }
        : { width: 'w-1/2 max-w-[220px] mx-auto', aspect: 'aspect-[4/3]' };
  const { width, aspect } = layout;

  if (loading || !src || failed) {
    return (
      <div
        className={cn(
          'rounded-xl bg-orange-50 border-2 border-orange-100 flex flex-col items-center justify-center gap-2 shadow-inner',
          width,
          aspect,
          className
        )}
        aria-busy={loading}
        aria-label={loading ? `Loading image for ${alt}` : undefined}
      >
        {loading ? (
          <>
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="text-[10px] font-medium text-orange-600/80">Plating…</span>
          </>
        ) : (
          <UtensilsCrossed className="w-10 h-10 text-orange-300" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl bg-stone-50 border-2 border-orange-100 overflow-hidden flex items-center justify-center shadow-sm',
        width,
        aspect,
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
