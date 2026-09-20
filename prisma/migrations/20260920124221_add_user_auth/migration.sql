-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: before this migration, Project/Task/Milestone.userId
-- stored the Google providerAccountId directly (the app used JWT-only
-- sessions, with no User table behind it). Materialize one User + Account
-- row per distinct legacy value seen across the three tables, then repoint
-- userId at the new User.id so the foreign keys added below have a real
-- row to reference. Profile fields (name/email/image) are left null here;
-- src/auth.ts fills them in from the Google profile on the user's next
-- sign-in rather than hardcoding personal data into a migration file.
CREATE TEMP TABLE "_user_map" AS
SELECT DISTINCT "userId" AS "legacyId",
  md5(random()::text || clock_timestamp()::text || "userId") AS "newId"
FROM (
  SELECT "userId" FROM "Project"
  UNION
  SELECT "userId" FROM "Task"
  UNION
  SELECT "userId" FROM "Milestone"
) legacy;

INSERT INTO "User" ("id", "createdAt", "updatedAt")
SELECT "newId", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM "_user_map";

INSERT INTO "Account" ("id", "userId", "type", "provider", "providerAccountId")
SELECT md5(random()::text || clock_timestamp()::text || "legacyId" || 'account'), "newId", 'oauth', 'google', "legacyId"
FROM "_user_map";

UPDATE "Project" p SET "userId" = m."newId" FROM "_user_map" m WHERE p."userId" = m."legacyId";
UPDATE "Task" t SET "userId" = m."newId" FROM "_user_map" m WHERE t."userId" = m."legacyId";
UPDATE "Milestone" ms SET "userId" = m."newId" FROM "_user_map" m WHERE ms."userId" = m."legacyId";

DROP TABLE "_user_map";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
