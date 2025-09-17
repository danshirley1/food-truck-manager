'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function LoadingCard() {
  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardContent className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading next scenario...</span>
        </div>
      </CardContent>
    </Card>
  );
}