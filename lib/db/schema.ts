import { pgTable, text, timestamp, boolean, serial, integer, numeric } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables (gestion boutique télécom) ---------------------------------
// Every table carries a plain `userId` column for per-user scoping (no RLS on Neon).

// Fournisseurs
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  contactName: text("contactName"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Produits (stock)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Smartphone, Accessoire, Audio, Charge, ...
  brand: text("brand"),
  supplierId: integer("supplierId"),
  purchasePrice: numeric("purchasePrice", { precision: 12, scale: 2 }).notNull().default("0"),
  salePrice: numeric("salePrice", { precision: 12, scale: 2 }).notNull().default("0"),
  quantity: integer("quantity").notNull().default(0),
  reorderThreshold: integer("reorderThreshold").notNull().default(5),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Ventes
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  productId: integer("productId").notNull(),
  productName: text("productName").notNull(), // snapshot au moment de la vente
  quantity: integer("quantity").notNull().default(1),
  unitSalePrice: numeric("unitSalePrice", { precision: 12, scale: 2 }).notNull().default("0"),
  unitPurchasePrice: numeric("unitPurchasePrice", { precision: 12, scale: 2 }).notNull().default("0"),
  customerName: text("customerName"),
  paymentMethod: text("paymentMethod"), // Espèces, Carte, Mobile Money, ...
  invoiceId: integer("invoiceId"), // rattachement à une facture (null = vente simple)
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Clients (carnet réutilisable)
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Factures
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  invoiceNumber: text("invoiceNumber").notNull(), // ex. F-2026-0001
  customerId: integer("customerId"), // null si client libre / supprimé
  customerName: text("customerName"), // snapshot conservé même si le client est supprimé
  status: text("status").notNull().default("paid"), // paid | unpaid
  paymentMethod: text("paymentMethod"),
  notes: text("notes"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"), // montant en euros (base)
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Paramètres (listes de référence : catégories, marques, moyens de paiement)
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  kind: text("kind").notNull(), // "category" | "brand" | "payment"
  value: text("value").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
