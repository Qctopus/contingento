/*
  Warnings:

  - Added the required column `riskAssessmentMatrix` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RiskAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "potentialHazards" TEXT NOT NULL,
    "hazards" TEXT NOT NULL,
    "riskAssessmentMatrix" TEXT NOT NULL,
    CONSTRAINT "RiskAssessment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RiskAssessment" ("hazards", "id", "planId", "potentialHazards") SELECT "hazards", "id", "planId", "potentialHazards" FROM "RiskAssessment";
DROP TABLE "RiskAssessment";
ALTER TABLE "new_RiskAssessment" RENAME TO "RiskAssessment";
CREATE UNIQUE INDEX "RiskAssessment_planId_key" ON "RiskAssessment"("planId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
