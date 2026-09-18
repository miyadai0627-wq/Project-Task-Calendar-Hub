-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Milestone_projectId_idx" ON "Milestone"("projectId");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- Data migration: Task.projectId / Milestone.projectId used to reference
-- the hardcoded projects in src/lib/mock-data.ts by a fixed slug
-- ('prj-hub' etc.) with no real row behind them. Materialize one Project
-- row per user that already has Task/Milestone data, for each of the
-- three legacy projects, then repoint projectId at the new row so the
-- foreign key added below has something real to reference.
CREATE TEMP TABLE "_legacy_project" ("slug" TEXT, "name" TEXT, "color" TEXT, "sortOrder" INTEGER);
INSERT INTO "_legacy_project" VALUES
  ('prj-hub', 'Task Calendar Hub', '#3B82F6', 1),
  ('prj-client', 'クライアント提案', '#8B5CF6', 2),
  ('prj-ops', '社内オペレーション', '#10B981', 3);

CREATE TEMP TABLE "_project_map" AS
SELECT
  u."userId",
  lp."slug",
  md5(random()::text || clock_timestamp()::text || lp."slug" || u."userId") AS "newId"
FROM (
  SELECT "userId" FROM "Task"
  UNION
  SELECT "userId" FROM "Milestone"
) u
CROSS JOIN "_legacy_project" lp;

INSERT INTO "Project" ("id", "userId", "name", "color", "status", "order", "createdAt", "updatedAt")
SELECT pm."newId", pm."userId", lp."name", lp."color", 'active', lp."sortOrder", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_project_map" pm
JOIN "_legacy_project" lp ON lp."slug" = pm."slug";

UPDATE "Task" t
SET "projectId" = pm."newId"
FROM "_project_map" pm
WHERE pm."userId" = t."userId" AND pm."slug" = t."projectId";

UPDATE "Milestone" m
SET "projectId" = pm."newId"
FROM "_project_map" pm
WHERE pm."userId" = m."userId" AND pm."slug" = m."projectId";

DROP TABLE "_project_map";
DROP TABLE "_legacy_project";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
