/*
  Warnings:

  - Added the required column `actionPlanByRisk` to the `ActionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testingAssessmentPlan` to the `ActionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longTermRiskReduction` to the `Strategy` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "actionPlanByRisk" TEXT NOT NULL,
    "implementationTimeline" TEXT NOT NULL,
    "resourceRequirements" TEXT NOT NULL,
    "responsibleParties" TEXT NOT NULL,
    "reviewUpdateSchedule" TEXT NOT NULL,
    "testingAssessmentPlan" TEXT NOT NULL,
    CONSTRAINT "ActionPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActionPlan" ("id", "implementationTimeline", "planId", "resourceRequirements", "responsibleParties", "reviewUpdateSchedule") SELECT "id", "implementationTimeline", "planId", "resourceRequirements", "responsibleParties", "reviewUpdateSchedule" FROM "ActionPlan";
DROP TABLE "ActionPlan";
ALTER TABLE "new_ActionPlan" RENAME TO "ActionPlan";
CREATE UNIQUE INDEX "ActionPlan_planId_key" ON "ActionPlan"("planId");
CREATE TABLE "new_Strategy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "preventionStrategies" TEXT NOT NULL,
    "responseStrategies" TEXT NOT NULL,
    "recoveryStrategies" TEXT NOT NULL,
    "longTermRiskReduction" TEXT NOT NULL,
    CONSTRAINT "Strategy_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Strategy" ("id", "planId", "preventionStrategies", "recoveryStrategies", "responseStrategies") SELECT "id", "planId", "preventionStrategies", "recoveryStrategies", "responseStrategies" FROM "Strategy";
DROP TABLE "Strategy";
ALTER TABLE "new_Strategy" RENAME TO "Strategy";
CREATE UNIQUE INDEX "Strategy_planId_key" ON "Strategy"("planId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
