'use client';

import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Scenario } from '@/lib/game';
import { fetchMenuImage } from '@/lib/scenarios/fetch-menu-image';

export function useMenuImages(
  setCurrentScenario: Dispatch<SetStateAction<Scenario | null>>
) {
  const [loadingMenuImageIds, setLoadingMenuImageIds] = useState<Set<string>>(
    () => new Set()
  );
  const loadGenerationRef = useRef(0);

  const loadMenuImages = useCallback(
    (scenario: Scenario) => {
      const generation = ++loadGenerationRef.current;
      const optionIds = scenario.menuOptions.map((o) => o.id);
      setLoadingMenuImageIds(new Set(optionIds));

      for (const option of scenario.menuOptions) {
        void (async () => {
          try {
            const imageUrl = await fetchMenuImage({
              label: option.label,
              imagePrompt: option.imagePrompt,
              location: scenario.dayContext.location,
            });

            if (
              generation !== loadGenerationRef.current ||
              !imageUrl
            ) {
              return;
            }

            setCurrentScenario((prev) => {
              if (!prev || prev.id !== scenario.id) return prev;
              return {
                ...prev,
                menuOptions: prev.menuOptions.map((o) =>
                  o.id === option.id ? { ...o, imageUrl } : o
                ),
              };
            });
          } finally {
            if (generation !== loadGenerationRef.current) return;
            setLoadingMenuImageIds((prev) => {
              const next = new Set(prev);
              next.delete(option.id);
              return next;
            });
          }
        })();
      }
    },
    [setCurrentScenario]
  );

  const isMenuImageLoading = useCallback(
    (optionId: string) => loadingMenuImageIds.has(optionId),
    [loadingMenuImageIds]
  );

  return { loadMenuImages, isMenuImageLoading, loadingMenuImageIds };
}
