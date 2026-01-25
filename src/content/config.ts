import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    color: z.string().default("mauve"),
    "page-type": z.literal("post").optional(),
    styles: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
