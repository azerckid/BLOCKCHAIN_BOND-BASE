import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Note: I'll use standard text for UUIDs as PKs for now to avoid extra dependencies 
// unless I check if cuid2 is available.
// Let's use crypto.randomUUID() on the app side or just let the app handle it.

export const bonds = sqliteTable("bonds", {
    id: text("id").primaryKey(), // UUID
    bondId: integer("bond_id"), // On-chain ID
    borrowerName: text("borrower_name").notNull(),
    region: text("region").notNull(),
    loanAmount: integer("loan_amount").notNull(), // USDC in local currency/units? No, USDC base.
    interestRate: integer("interest_rate").notNull(), // Basis points
    maturityDate: integer("maturity_date").notNull(), // Timestamp
    status: text("status", { enum: ["PENDING", "ACTIVE", "REPAID", "DEFAULT"] }).default("PENDING").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
});

export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
    image: text("image"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id),
});

export const account = sqliteTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const investors = sqliteTable("investors", {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id), // Link to auth user
    walletAddress: text("wallet_address").unique().notNull(),
    kycStatus: text("kyc_status", { enum: ["NOT_STARTED", "PENDING", "VERIFIED", "REJECTED"] }).default("NOT_STARTED").notNull(),
    autoReinvest: integer("auto_reinvest", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at").notNull(),
});

export const investments = sqliteTable("investments", {
    id: text("id").primaryKey(),
    investorId: text("investor_id").references(() => investors.id).notNull(),
    bondId: text("bond_id").references(() => bonds.id).notNull(),
    tokenAmount: integer("token_amount").notNull(),
    usdcAmount: integer("usdc_amount").notNull(),
    transactionHash: text("transaction_hash").notNull(),
    createdAt: integer("created_at").notNull(),
});

export const yieldDistributions = sqliteTable("yield_distributions", {
    id: text("id").primaryKey(),
    bondId: text("bond_id").references(() => bonds.id).notNull(),
    investorId: text("investor_id").references(() => investors.id).notNull(),
    yieldAmount: integer("yield_amount").notNull(),
    transactionHash: text("transaction_hash"),
    distributedAt: integer("distributed_at").notNull(),
});

export const repayments = sqliteTable("repayments", {
    id: text("id").primaryKey(),
    bondId: text("bond_id").references(() => bonds.id).notNull(),
    amount: integer("amount").notNull(),
    repaymentDate: integer("repayment_date").notNull(),
    oracleRequestId: text("oracle_request_id"),
});

// Choonsim Project Integration
export const choonsimProjects = sqliteTable("choonsim_projects", {
    id: text("id").primaryKey(), // Default "choonsim-main"
    name: text("name").notNull(),
    totalFollowers: integer("total_followers").default(0),
    totalSubscribers: integer("total_subscribers").default(0),
    southAmericaShare: integer("south_america_share").default(70), // Percent
    japanShare: integer("japan_share").default(30), // Percent
    otherRegionShare: integer("other_region_share").default(0), // Percent
    updatedAt: integer("updated_at").notNull(), // Timestamp
});

export const choonsimMetricsHistory = sqliteTable("choonsim_metrics_history", {
    id: text("id").primaryKey(),
    projectId: text("project_id").references(() => choonsimProjects.id).notNull(),
    followers: integer("followers").notNull(),
    subscribers: integer("subscribers").notNull(),
    recordedAt: integer("recorded_at").notNull(), // Timestamp
});

export const choonsimRevenue = sqliteTable("choonsim_revenue", {
    id: text("id").primaryKey(),
    projectId: text("project_id").references(() => choonsimProjects.id).notNull(),
    amount: integer("amount").notNull(), // USDC base units
    source: text("source").notNull(), // SUBSCRIPTION, ROYALTY, etc.
    description: text("description"),
    receivedAt: integer("received_at").notNull(), // Timestamp
    onChainTxHash: text("on_chain_tx_hash"),
});

export const choonsimMilestones = sqliteTable("choonsim_milestones", {
    id: text("id").primaryKey(),
    projectId: text("project_id").references(() => choonsimProjects.id).notNull(),
    key: text("key").notNull(), // e.g., "FOLLOWERS_50K"
    description: text("description").notNull(),
    achievedAt: integer("achieved_at").notNull(), // Timestamp
    bonusAmount: integer("bonus_amount"),
});

export const faucetRequests = sqliteTable("faucet_requests", {
    id: text("id").primaryKey(),
    address: text("address").notNull(),
    requestedAt: integer("requested_at").notNull(),
    amountUsdc: integer("amount_usdc").notNull(),
    txHash: text("tx_hash"),
});
