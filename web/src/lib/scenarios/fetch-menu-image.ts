/**
 * Client fetch for a single menu special image.
 */

export async function fetchMenuImage(params: {
  label: string;
  imagePrompt?: string;
  location: string;
}): Promise<string | undefined> {
  const response = await fetch('/api/scenarios/menu-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    imageUrl?: string | null;
    error?: string;
  };

  if (!response.ok || !data.success) {
    console.warn('[fetchMenuImage]', data.error ?? response.status);
    return undefined;
  }

  return data.imageUrl ?? undefined;
}
