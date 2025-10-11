const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/admin2/ParishOverview.tsx',
  'src/components/admin2/ImprovedParishOverview.tsx',
  'src/components/admin2/RiskCalculatorTab.tsx',
  'src/components/admin2/ImprovedRiskCalculatorTab.tsx',
  'src/components/admin2/ImprovedParishDashboard.tsx',
  'src/components/admin2/RiskMatrix.tsx',
  'src/components/admin2/CompactRiskMatrix.tsx',
  'src/components/admin2/CompactParishOverview.tsx'
];

console.log('🧹 Cleaning up isCoastal/isUrban references...\n');

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  
  // Remove isCoastal/isUrban badge rendering blocks
  content = content.replace(/\{parish\.isCoastal\s*&&\s*\([^}]+?\}\s*\)\}/gs, '');
  content = content.replace(/\{parish\.isUrban\s*&&\s*\([^}]+?\}\s*\)\}/gs, '');
  content = content.replace(/\{p\.isCoastal\s*&&\s*\([^}]+?\}\s*\)\}/gs, '');
  content = content.replace(/\{p\.isUrban\s*&&\s*\([^}]+?\}\s*\)\}/gs, '');
  
  // Remove filter counts for coastal/urban
  content = content.replace(/parishes\.filter\(p\s*=>\s*p\.isCoastal\)\.length/g, '0');
  content = content.replace(/parishes\.filter\(p\s*=>\s*p\.isUrban\)\.length/g, '0');
  
  // Remove coastal/urban stat cards
  content = content.replace(/<div className="text-center">\s*<div className="text-2xl font-bold text-blue-600">\s*\{parishes\.filter\(p => p\.isCoastal\)\.length\}\s*<\/div>\s*<div className="text-sm text-gray-600">Coastal Parishes<\/div>\s*<\/div>/gs, '');
  content = content.replace(/<div className="text-center">\s*<div className="text-2xl font-bold text-purple-600">\s*\{parishes\.filter\(p => p\.isUrban\)\.length\}\s*<\/div>\s*<div className="text-sm text-gray-600">Urban Parishes<\/div>\s*<\/div>/gs, '');
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed in ${filePath}`);
  }
});

console.log('\n✨ Cleanup complete!');

