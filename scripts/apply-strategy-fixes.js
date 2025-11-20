#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/AdminStrategyCards.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Applying fixes to AdminStrategyCards.tsx...\n');

// Fix 1: Force loading all strategies from API
content = content.replace(
    "// Check if we have pre-filled strategies from admin backend\n        if (preFillData?.preFilledFields?.STRATEGIES?.['Business Continuity Strategies']) {",
    "// ALWAYS load all strategies from API (not just pre-filled subset)\n        // This ensures manually selected risks have their strategies available\n        if (false && preFillData?.preFilledFields?.STRATEGIES?.['Business Continuity Strategies']) {"
);
console.log('✅ Fix 1: Force API loading');

// Fix 2: Auto-select strategies for selected risks
content = content.replace(
    /\/\/ Auto-select essential and recommended strategies\s+const autoSelectedIds = allStrategies\s+\.filter\(\(strategy: any\) => \s+strategy\.priorityTier === 'essential' \|\| strategy\.priorityTier === 'recommended'\s+\)\s+\.map\(\(s: any\) => s\.id\)\s+setSelectedStrategyIds\(autoSelectedIds\)/,
    `// Auto-select strategies that match the SELECTED risks
            const selectedRiskIds = riskData?.riskAssessmentMatrix
              ?.filter((r: any) => r.isSelected || r.isPreSelected)
              .map((r: any) => r.hazardId) || []
            
            const autoSelectedIds = allStrategies
              .filter((strategy: any) => {
                const matchesPrimary = selectedRiskIds.includes(strategy.primaryRisk)
                let matchesSecondary = false
                if (strategy.secondaryRisks) {
                  try {
                    const secRisks = typeof strategy.secondaryRisks === 'string'
                      ? (strategy.secondaryRisks.startsWith('[') ? JSON.parse(strategy.secondaryRisks) : [strategy.secondaryRisks])
                      : (Array.isArray(strategy.secondaryRisks) ? strategy.secondaryRisks : [])
                    matchesSecondary = secRisks.some((riskId: string) => selectedRiskIds.includes(riskId))
                  } catch (e) {}
                }
                return matchesPrimary || matchesSecondary
              })
              .map((s: any) => s.id)
            setSelectedStrategyIds(autoSelectedIds)`
);
console.log('✅ Fix 2: Auto-select for selected risks');

// Fix 3: Filter validHazards to only selected risks
content = content.replace(
    /\/\/ If strategies have the new priorityTier field, use the enhanced UI\s+if \(useNewUI\) \{\s+return \(\s+<StrategySelectionStep\s+strategies=\{strategies as any\}\s+selectedStrategies=\{selectedStrategyIds\}\s+onStrategyToggle=\{handleStrategyIdToggle\}\s+onContinue=\{handleContinue\}\s+countryCode=\{locationData\?\.countryCode \|\| 'JM'\}\s+validHazards=\{preFillData\?\.hazards\}/,
    `// If strategies have the new priorityTier field, use the enhanced UI
  if (useNewUI) {
    // Filter to only include risks that are SELECTED (checked) in the risk assessment matrix
    const selectedRisks = riskData?.riskAssessmentMatrix?.filter((r: any) => r.isSelected || r.isPreSelected) || []
    
    return (
      <StrategySelectionStep
        strategies={strategies as any}
        selectedStrategies={selectedStrategyIds}
        onStrategyToggle={handleStrategyIdToggle}
        onContinue={handleContinue}
        countryCode={locationData?.countryCode || 'JM'}
        validHazards={selectedRisks}`
);
console.log('✅ Fix 3: Filter displayed risks');

// Fix 4: Update useEffect dependencies
content = content.replace(
    '  }, [preFillData, locale])',
    '  }, [locale, riskData])'
);
console.log('✅ Fix 4: Update dependencies\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('🎉 All fixes applied successfully!');
