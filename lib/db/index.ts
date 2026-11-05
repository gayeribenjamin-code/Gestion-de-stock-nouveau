import dns from "node:dns"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

// Le runtime v0 peut ne pas joindre les endpoints Neon IPv6.
// Préférer IPv4 pour éviter les erreurs ENETUNREACH sur la connexion PostgreSQL.
dns.setDefaultResultOrder("ipv4first")
import * as schema from "./schema"

export const pool = new Pool({
  connectionString:
    process.env.NEON_DATABASE_URL ??
    process.env.NEON_POSTGRES_URL ??
    process.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })
