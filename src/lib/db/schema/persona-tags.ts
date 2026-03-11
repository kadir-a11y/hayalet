import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { personas } from "./personas";
import { tags } from "./tags";

export const personaTags = pgTable(
  "persona_tags",
  {
    personaId: uuid("persona_id")
      .notNull()
      .references(() => personas.id),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (table) => [primaryKey({ columns: [table.personaId, table.tagId] })],
);
