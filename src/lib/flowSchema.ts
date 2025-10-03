// Schema Zod para validação de fluxos
import * as z from 'zod';

export const flowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()),
});

export const flowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  sourceHandle: z.string().optional(),
  target: z.string().min(1),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
});

export const flowDTOSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  nodes: z.array(flowNodeSchema),
  edges: z.array(flowEdgeSchema),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number().min(0.1).max(4),
  }),
  updatedAt: z.string(),
});

export type FlowDTOValidated = z.infer<typeof flowDTOSchema>;

