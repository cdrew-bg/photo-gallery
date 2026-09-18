import { z } from 'zod';

export const imageEntrySchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(['photo', 'video']),
    filename: z.string().min(1),
    ext: z.string().min(1),
    contentType: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    bytes: z.number().int().positive(),
    durationSeconds: z.number().positive().optional(),
    takenAt: z.string().datetime({ offset: true }),
    album: z.string().min(1).optional(),
  })
  .strict();

export const manifestSchema = z.array(imageEntrySchema);

export type ImageEntry = z.infer<typeof imageEntrySchema>;

export type Manifest = z.infer<typeof manifestSchema>;
