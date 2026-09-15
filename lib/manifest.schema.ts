import { z } from 'zod';

export const imageEntrySchema = z
  .object({
    id: z.string().min(1),
    filename: z.string().min(1),
    ext: z.string().min(1),
    contentType: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    bytes: z.number().int().positive(),
    takenAt: z.string().datetime({ offset: true }),
  })
  .strict();

export const manifestSchema = z.array(imageEntrySchema);

export type ImageEntry = z.infer<typeof imageEntrySchema>;

export type Manifest = z.infer<typeof manifestSchema>;
