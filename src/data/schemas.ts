import { z } from "zod";

export const entryTypeSchema = z.enum([
  "domain",
  "archetype",
  "project",
  "component",
  "tool",
  "principle",
  "comparison",
  "journal",
]);
export type EntryType = z.infer<typeof entryTypeSchema>;

export const projectStatusSchema = z.enum([
  "building",
  "planned",
  "done",
  "shelved",
]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const tierSchema = z.enum(["T1", "T2", "T3", "T4"]);
export type Tier = z.infer<typeof tierSchema>;

const baseEntry = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  deck: z.string().optional(),
  domain: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const domainSchema = baseEntry.extend({
  type: z.literal("domain"),
});

export const archetypeSchema = baseEntry.extend({
  type: z.literal("archetype"),
  analog: z.string().optional(),
});

export const projectSchema = baseEntry.extend({
  type: z.literal("project"),
  tier: tierSchema,
  status: projectStatusSchema,
  archetype: z.string().nullable().optional(),
  cost: z.string().optional(),
  started: z.string().optional(),
});

export const componentSchema = baseEntry.extend({
  type: z.literal("component"),
});

export const toolSchema = baseEntry.extend({
  type: z.literal("tool"),
});

export const principleSchema = baseEntry.extend({
  type: z.literal("principle"),
});

export const comparisonSchema = baseEntry.extend({
  type: z.literal("comparison"),
});

export const journalSchema = baseEntry.extend({
  type: z.literal("journal"),
  date: z.string(),
  project: z.string().optional(),
});

export const entrySchema = z.discriminatedUnion("type", [
  domainSchema,
  archetypeSchema,
  projectSchema,
  componentSchema,
  toolSchema,
  principleSchema,
  comparisonSchema,
  journalSchema,
]);
export type Entry = z.infer<typeof entrySchema>;
export type Domain = z.infer<typeof domainSchema>;
export type Archetype = z.infer<typeof archetypeSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Component = z.infer<typeof componentSchema>;
export type Tool = z.infer<typeof toolSchema>;
export type Principle = z.infer<typeof principleSchema>;
export type Comparison = z.infer<typeof comparisonSchema>;
export type Journal = z.infer<typeof journalSchema>;

/* ── Inventory ─────────────────────────────────────────── */
export const invCategorySchema = z.enum([
  "mcu",
  "ic",
  "passive",
  "sensor",
  "actuator",
  "power",
  "connector",
  "module",
  "mech",
  "consumable",
  "tool",
  "other",
]);
export type InvCategory = z.infer<typeof invCategorySchema>;

export const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  pn: z.string().optional().default(""),
  cat: invCategorySchema,
  qty: z.number().int().nonnegative().default(0),
  min: z.number().int().nonnegative().default(0),
  bin: z.string().optional().default(""),
  supplier: z.string().optional().default(""),
  unitCost: z.number().nonnegative().default(0),
  unit: z.string().default("pcs"),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional().default(""),
  updated: z.string().optional(),
});
export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export const inventoryFileSchema = z.union([
  z.array(inventoryItemSchema.partial({ id: true })),
  z.object({
    v: z.number().optional(),
    generator: z.string().optional(),
    exported: z.string().optional(),
    count: z.number().optional(),
    items: z.array(inventoryItemSchema.partial({ id: true })),
  }),
]);
