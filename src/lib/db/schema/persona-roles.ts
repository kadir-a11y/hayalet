import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { personas } from "./personas";
import { roles } from "./roles";

export const personaRoles = pgTable(
  "persona_roles",
  {
    personaId: uuid("persona_id")
      .notNull()
      .references(() => personas.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.personaId, table.roleId] })]
);
