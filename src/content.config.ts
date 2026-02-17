import { defineCollection, reference } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const accounts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/accounts' }),
  schema: z.object({
    uid: z.number(),
    title: z.string().optional(),
    type: z.enum(['lead', 'client']).default('client'),
    status: z.enum(['active', 'inactive', 'potential']),
    contact: z.string(),
    since: z.coerce.date(),
  }),
})

const contacts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/contacts' }),
  schema: z.object({
    uid: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.string().optional(),
    account: reference('accounts'),
    is_primary: z.boolean().default(false),
  }),
})

const deals = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/deals' }),
  schema: z.object({
    uid: z.number(),
    account: reference('accounts'),
    contact: reference('contacts').optional(),
    stage: z.enum(['discovery', 'proposal', 'negotiation', 'closed-won', 'closed-lost']),
    value: z.number().optional(),
    expected_close: z.coerce.date().optional(),
    actual_close: z.coerce.date().optional(),
    lost_reason: z.string().optional(),
  }),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    uid: z.number(),
    title: z.string().optional(),
    account: reference('accounts'),
    status: z.enum(['planning', 'in-progress', 'done', 'paused']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    repo: z.string().optional(),
    start_date: z.coerce.date(),
    deadline: z.coerce.date().optional(),
    budget: z.number().optional(),
  }),
})

const tasks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tasks' }),
  schema: z.object({
    uid: z.number(),
    project: reference('projects'),
    status: z.enum(['todo', 'in-progress', 'done', 'blocked']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    due: z.coerce.date().optional(),
  }),
})

const kb = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/kb' }),
  schema: z.object({
    uid: z.number(),
    tags: z.array(z.string()).optional(),
    updated: z.coerce.date().optional(),
  }),
})

const meetings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/meetings' }),
  schema: z.object({
    uid: z.number(),
    date: z.coerce.date(),
    attendees: z.array(z.string()),
    type: z.enum(['discovery', 'standup', 'review', 'planning', 'retrospective', 'other']),
    account: reference('accounts').optional(),
    project: reference('projects').optional(),
    action_items: z.array(z.string()).optional(),
  }),
})

const journals = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journals' }),
  schema: z.object({
    uid: z.number(),
    date: z.coerce.date(),
    mood: z.enum(['great', 'good', 'neutral', 'bad', 'terrible']).optional(),
    tags: z.array(z.string()).optional(),
    projects: z.array(reference('projects')).optional(),
  }),
})

export const collections = { accounts, contacts, deals, projects, tasks, kb, meetings, journals }
