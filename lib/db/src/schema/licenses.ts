import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";
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
import { beatsTable } from "./beats";

export const licensesTable = pgTable(
  "licenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    beatId: uuid("beat_id")
      .notNull()
      .references(() => beatsTable.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    description: text("description").notNull().default(""),
    priceMinor: integer("price_minor").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("licenses_beat_name_unique").on(table.beatId, table.name),
    index("licenses_beat_active_idx").on(table.beatId, table.active),
    check("licenses_price_nonnegative_check", sql`${table.priceMinor} >= 0`),
    check(
      "licenses_currency_code_check",
      sql`${table.currency} ~ '^[A-Z]{3}$'`,
    ),
  ],
);

export const insertLicenseSchema = createInsertSchema(licensesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type License = typeof licensesTable.$inferSelect;
