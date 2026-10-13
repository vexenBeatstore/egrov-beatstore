import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const beatsTable = pgTable(
  "beats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 100 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    genre: varchar("genre", { length: 60 }).notNull(),
    bpm: integer("bpm").notNull(),
    key: varchar("key", { length: 32 }).notNull(),
    description: text("description").notNull().default(""),
    coverUrl: text("cover_url"),
    previewUrl: text("preview_url"),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("beats_slug_unique").on(table.slug),
    index("beats_published_created_idx").on(table.published, table.createdAt),
    index("beats_genre_published_idx").on(table.genre, table.published),
    check(
      "beats_bpm_range_check",
      sql`${table.bpm} >= 20 AND ${table.bpm} <= 300`,
    ),
  ],
);

export const insertBeatSchema = createInsertSchema(beatsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBeat = z.infer<typeof insertBeatSchema>;
export type Beat = typeof beatsTable.$inferSelect;
