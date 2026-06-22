"use client";

import {
  SIGNATURE_DISH_MAX_LENGTH,
  type SignatureDishRecord,
} from "@/hooks/useSignatureDish";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignatureDishPanelProps {
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onClearCurrent: () => void;
  onEditCurrent?: () => void;
  canSubmit: boolean;
  currentRecord?: SignatureDishRecord;
  history: SignatureDishRecord[];
}

function DishImage({
  record,
  className,
}: {
  record: SignatureDishRecord;
  className?: string;
}) {
  if (record.status === "generating") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/80 aspect-square",
          className,
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <span className="text-[10px] font-medium text-violet-600">
          Creating…
        </span>
      </div>
    );
  }

  if (record.status === "blocked") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50/80 min-h-[140px] p-3 text-center",
          className,
        )}
      >
        <UtensilsCrossed className="h-8 w-8 shrink-0 text-amber-500" />
        <p className="text-[12px] font-medium text-amber-800 leading-snug">
          {record.error ?? "That description doesn't fit our kitchen."}
        </p>
      </div>
    );
  }

  if (record.status === "error") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-red-100 bg-red-50/50 aspect-square p-3 text-center",
          className,
        )}
      >
        <UtensilsCrossed className="h-8 w-8 text-red-300" />
        <p className="text-[10px] text-red-600 leading-snug">
          {record.error ?? "Failed"}
        </p>
      </div>
    );
  }

  if (record.imageUrl) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border-2 border-violet-100 bg-stone-50 aspect-square flex items-center justify-center",
          className,
        )}
      >
        <img
          src={record.imageUrl}
          alt={record.description}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  return null;
}

export function SignatureDishPanel({
  draft,
  onDraftChange,
  onSubmit,
  onClearCurrent,
  onEditCurrent,
  canSubmit,
  currentRecord,
  history,
}: SignatureDishPanelProps) {
  const charsLeft = SIGNATURE_DISH_MAX_LENGTH - draft.length;

  return (
    <Card className="h-fit border-violet-200 bg-white/90 shadow-md lg:sticky lg:top-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-violet-900">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Signature Dish
            </CardTitle>
            <CardDescription className="mt-2">
              Dream up anything you fancy!
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 border-violet-200 text-violet-700"
          >
            Optional
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {currentRecord ? (
          <div className="space-y-2">
            <p className="text-xs font-bold">Your creation:</p>
            <p className="text-sm font-medium italic">
              &ldquo;{currentRecord.description}&rdquo;
            </p>
            <DishImage record={currentRecord} className="w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="signature-dish-input"
              className="text-sm font-medium text-foreground"
            >
              What&apos;s your wild special?
            </label>
            <textarea
              id="signature-dish-input"
              value={draft}
              onChange={(e) =>
                onDraftChange(
                  e.target.value.slice(0, SIGNATURE_DISH_MAX_LENGTH),
                )
              }
              placeholder="Beans and snails, cockroaches on toast, galaxy glitter ramen…"
              rows={4}
              className="w-full resize-none rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm leading-relaxed shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            />
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "text-xs",
                  charsLeft < 20 ? "text-amber-600" : "text-muted-foreground",
                )}
              >
                {charsLeft} left
              </span>
              <Button
                size="sm"
                disabled={!canSubmit}
                onClick={onSubmit}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Create dish
              </Button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-3 border-t border-violet-100 pt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Previous specials
            </p>
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {history.map((record) => (
                <div key={record.turn} className="space-y-1.5">
                  <p className="text-xs text-foreground line-clamp-2">
                    {record.description}
                  </p>
                  <DishImage record={record} className="w-full max-w-[180px]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {currentRecord && (
          <div className="space-y-2 border-t border-violet-100 pt-4">
            {currentRecord.status === "blocked" && onEditCurrent ? (
              <Button
                type="button"
                size="sm"
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={onEditCurrent}
              >
                Edit description
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-violet-200 text-violet-800 hover:bg-violet-50"
              onClick={onClearCurrent}
            >
              Cancel / Create new
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
