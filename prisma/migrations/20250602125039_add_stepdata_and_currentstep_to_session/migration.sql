/*
  Warnings:

  - Added the required column `currentStep` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stepData` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "currentStep" TEXT NOT NULL,
    "stepData" TEXT NOT NULL
);
INSERT INTO "new_Session" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
