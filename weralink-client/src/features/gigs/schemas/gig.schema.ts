import { z } from 'zod';

export const GigCategorySchema = z.enum([
  'TRANSLATION',
  'MARKETING',
  'DATA_ENTRY',
  'BUG_HUNTING',
  'AI_LABELING',
  'RESEARCH',
]);

export const WorkTypeSchema = z.enum(['REMOTE', 'ON_SITE', 'HYBRID']);

export const EvidenceTypeSchema = z.enum(['FILE', 'LINK', 'TEXT', 'IMAGE', 'VIDEO_LINK']);

export const EvidenceRequirementSchema = z.object({
  tag: z.string().min(1, 'Tag is required'),
  label: z.string().min(1, 'Label is required'),
  type: EvidenceTypeSchema,
  accept: z.array(z.string()).optional(),
  maxSizeMB: z.number().optional(),
  min: z.number().int().min(0).default(1),
  required: z.boolean().default(true),
});

export const CreateGigSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000),
  category: GigCategorySchema,
  workType: WorkTypeSchema.default('REMOTE'),
  location: z.string().min(1, 'Location is required').max(200),
  payAmount: z.number().positive('Pay amount must be positive'),
  currency: z.string().min(3).max(3).default('KES'),
  expiresAt: z.coerce.date().refine((data) => !isNaN(data.getTime()) && data > new Date(), { message: 'A valid future deadline is required' }),
  skillIds: z.array(z.string()).min(1, 'At least one skill is required'),
  evidenceTemplate: z.array(EvidenceRequirementSchema).min(1, 'At least one evidence requirement is needed'),
});

export type CreateGigInput = z.infer<typeof CreateGigSchema>;
export type EvidenceRequirement = z.infer<typeof EvidenceRequirementSchema>;
export type GigCategory = z.infer<typeof GigCategorySchema>;
export type WorkType = z.infer<typeof WorkTypeSchema>;
