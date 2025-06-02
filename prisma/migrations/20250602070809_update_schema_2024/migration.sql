/*
  Warnings:

  - You are about to drop the `BusinessFunction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BusinessProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BusinessFunction";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BusinessProfile";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PlanInformation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "planManager" TEXT NOT NULL,
    "alternateManager" TEXT NOT NULL,
    "planLocation" TEXT NOT NULL,
    CONSTRAINT "PlanInformation_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessOverview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "businessLicenseNumber" TEXT NOT NULL,
    "businessPurpose" TEXT NOT NULL,
    "productsAndServices" TEXT NOT NULL,
    "serviceDeliveryMethods" TEXT NOT NULL,
    "operatingHours" TEXT NOT NULL,
    "keyPersonnel" TEXT NOT NULL,
    "minimumResources" TEXT NOT NULL,
    "customerBase" TEXT NOT NULL,
    "serviceProviderBCP" TEXT NOT NULL,
    CONSTRAINT "BusinessOverview_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EssentialFunction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "supplyChainManagement" TEXT NOT NULL,
    "staffManagement" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "productsServices" TEXT NOT NULL,
    "infrastructureFacilities" TEXT NOT NULL,
    "sales" TEXT NOT NULL,
    "administration" TEXT NOT NULL,
    CONSTRAINT "EssentialFunction_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanInformation_planId_key" ON "PlanInformation"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessOverview_planId_key" ON "BusinessOverview"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "EssentialFunction_planId_key" ON "EssentialFunction"("planId");
