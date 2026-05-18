/**
 * POST /api/scenarios/menu-image — generate one menu special image.
 */

import { z } from 'zod';
import { assertOpenAiConfigured } from '@/lib/ai/provider';
import { generateMenuImageForOption } from '@/lib/ai/generate-menu-images';

const BodySchema = z.object({
  label: z.string().min(1),
  imagePrompt: z.string().optional(),
  location: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    assertOpenAiConfigured();

    const body = BodySchema.safeParse(await request.json());
    if (!body.success) {
      return Response.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { label, imagePrompt, location } = body.data;
    const imageUrl = await generateMenuImageForOption(label, imagePrompt, {
      location,
      crowdDetail: '',
      crowdVibe: '',
    });

    return Response.json({
      success: true,
      imageUrl: imageUrl ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate image';
    console.error('[API] POST /api/scenarios/menu-image error:', message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
