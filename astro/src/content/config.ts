// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

export const collections = {
    "socials": defineCollection({
        type: "data",
        schema: z.object({
           link: z.string(),
           name: z.string(),
           icon_name: z.string(),
           rank: z.number()
        })
    }),
    "languages": defineCollection({
        type: "data",
        schema: z.object({
            name: z.string(),
            verbosity: z.number(),
            icon_name: z.string(),
            rank: z.number()
        })
    }),
    "projects": defineCollection({
        type: "data",
        schema: z.object({
           name: z.string(),
           description: z.string(),
           link: z.string(),
           languages: z.array(z.string()),
           rank: z.number()
        })
    }),
    "music": defineCollection({
        type: "data",
        schema: z.object({
            name: z.string(),
            description: z.string(),
            file_name: z.string(),
            date: z.string().transform((str) => new Date(str)),
            bandcamp_embed: z.object({
                large: z.string(),
                small: z.string()
            }),
            links: z.array(z.object({
                name: z.string(),
                link: z.string()
            })),
            parent: z.optional(z.string()),
            lyrics: z.optional(z.boolean()),
            video: z.optional(z.boolean())
        })
    })
};