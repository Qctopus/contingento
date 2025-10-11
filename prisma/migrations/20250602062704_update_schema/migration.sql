-- CreateTable
CREATE TABLE "BusinessContinuityPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessLicenseNumber" TEXT NOT NULL,
    "businessPurpose" TEXT NOT NULL,
    "productsAndServices" TEXT NOT NULL,
    "serviceDelivery" TEXT NOT NULL,
    "operatingHours" TEXT NOT NULL,
    "serviceProviderBCP" TEXT NOT NULL,
    CONSTRAINT "BusinessProfile_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessFunction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "supplyChainManagement" TEXT NOT NULL,
    "staff" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "productsServices" TEXT NOT NULL,
    "infrastructureFacilities" TEXT NOT NULL,
    "sales" TEXT NOT NULL,
    "administration" TEXT NOT NULL,
    CONSTRAINT "BusinessFunction_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "hazards" TEXT NOT NULL,
    CONSTRAINT "RiskAssessment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "preventionStrategies" TEXT NOT NULL,
    "responseStrategies" TEXT NOT NULL,
    "recoveryStrategies" TEXT NOT NULL,
    CONSTRAINT "Strategy_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "implementationTimeline" TEXT NOT NULL,
    "resourceRequirements" TEXT NOT NULL,
    "responsibleParties" TEXT NOT NULL,
    "reviewUpdateSchedule" TEXT NOT NULL,
    CONSTRAINT "ActionPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_planId_key" ON "BusinessProfile"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessFunction_planId_key" ON "BusinessFunction"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskAssessment_planId_key" ON "RiskAssessment"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Strategy_planId_key" ON "Strategy"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "ActionPlan_planId_key" ON "ActionPlan"("planId");
