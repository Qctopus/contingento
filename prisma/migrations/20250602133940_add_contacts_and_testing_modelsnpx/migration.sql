-- CreateTable
CREATE TABLE "ContactsInformation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "staffContactInfo" TEXT NOT NULL,
    "keyCustomerContacts" TEXT NOT NULL,
    "supplierInformation" TEXT NOT NULL,
    "emergencyServicesUtilities" TEXT NOT NULL,
    "criticalBusinessInfo" TEXT NOT NULL,
    "planDistributionList" TEXT NOT NULL,
    CONSTRAINT "ContactsInformation_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestingMaintenance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "planTestingSchedule" TEXT NOT NULL,
    "planRevisionHistory" TEXT NOT NULL,
    "improvementTracking" TEXT NOT NULL,
    "annualReviewProcess" TEXT NOT NULL,
    "triggerEventsForUpdates" TEXT NOT NULL,
    CONSTRAINT "TestingMaintenance_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ContactsInformation_planId_key" ON "ContactsInformation"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "TestingMaintenance_planId_key" ON "TestingMaintenance"("planId");
