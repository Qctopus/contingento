const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reviewStrategies() {
  try {
    const strategies = await prisma.riskMitigationStrategy.findMany({
      include: {
        actionSteps: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    console.log(`\n📊 STRATEGY QUALITY REVIEW - ${strategies.length} Strategies\n`);
    console.log('='.repeat(80));

    for (const strategy of strategies) {
      const parseMultilingual = (value) => {
        if (!value) return null;
        if (typeof value === 'string' && value.startsWith('{')) {
          try {
            const parsed = JSON.parse(value);
            return parsed.en || Object.values(parsed)[0];
          } catch {
            return value;
          }
        }
        if (typeof value === 'object') {
          return value.en || Object.values(value)[0];
        }
        return value;
      };

      const name = parseMultilingual(strategy.name) || strategy.strategyId;
      const smeTitle = parseMultilingual(strategy.smeTitle);
      const smeSummary = parseMultilingual(strategy.smeSummary);
      const desc = parseMultilingual(strategy.description);
      
      console.log(`\n📋 ${name}`);
      console.log('-'.repeat(80));
      
      // Check SME content
      console.log(`\n📝 Content Quality:`);
      console.log(`   SME Title: ${smeTitle ? '✅' : '❌'} ${smeTitle || 'Missing'}`);
      console.log(`   SME Summary: ${smeSummary ? '✅' : '❌'} ${smeSummary ? smeSummary.substring(0, 80) + '...' : 'Missing'}`);
      console.log(`   Description: ${desc ? '✅' : '❌'} ${desc ? desc.substring(0, 80) + '...' : 'Missing'}`);
      
      // Check guidance fields
      const benefits = parseMultilingual(strategy.benefitsBullets);
      const tips = parseMultilingual(strategy.helpfulTips);
      const mistakes = parseMultilingual(strategy.commonMistakes);
      const example = parseMultilingual(strategy.realWorldExample);
      const lowBudget = parseMultilingual(strategy.lowBudgetAlternative);
      const diy = parseMultilingual(strategy.diyApproach);
      
      console.log(`\n🎯 Guidance Content:`);
      console.log(`   Benefits: ${Array.isArray(benefits) && benefits.length > 0 ? '✅ ' + benefits.length + ' items' : '❌ Missing'}`);
      console.log(`   Tips: ${Array.isArray(tips) && tips.length > 0 ? '✅ ' + tips.length + ' items' : '❌ Missing'}`);
      console.log(`   Mistakes: ${Array.isArray(mistakes) && mistakes.length > 0 ? '✅ ' + mistakes.length + ' items' : '❌ Missing'}`);
      console.log(`   Real Example: ${example ? '✅' : '❌'}`);
      console.log(`   Low Budget: ${lowBudget ? '✅' : '❌'}`);
      console.log(`   DIY Approach: ${diy ? '✅' : '❌'}`);
      
      // Check action steps
      console.log(`\n📋 Action Steps: ${strategy.actionSteps.length} total`);
      
      let completeSteps = 0;
      let incompleteSteps = 0;
      
      for (const step of strategy.actionSteps) {
        const stepTitle = parseMultilingual(step.title);
        const stepDesc = parseMultilingual(step.description);
        const stepWhy = parseMultilingual(step.whyThisStepMatters);
        const stepDone = parseMultilingual(step.howToKnowItsDone);
        const stepFree = parseMultilingual(step.freeAlternative);
        
        const hasEssentials = stepTitle && stepDesc;
        const hasGuidance = stepWhy || stepDone || stepFree;
        
        if (hasEssentials && hasGuidance) {
          completeSteps++;
        } else {
          incompleteSteps++;
        }
      }
      
      console.log(`   ✅ Complete: ${completeSteps}`);
      console.log(`   ⚠️  Incomplete: ${incompleteSteps}`);
      
      // Overall score
      const scores = [
        smeTitle ? 1 : 0,
        smeSummary ? 1 : 0,
        Array.isArray(benefits) && benefits.length > 0 ? 1 : 0,
        Array.isArray(tips) && tips.length > 0 ? 1 : 0,
        Array.isArray(mistakes) && mistakes.length > 0 ? 1 : 0,
        example ? 1 : 0,
        lowBudget ? 1 : 0,
        diy ? 1 : 0,
        strategy.actionSteps.length > 0 ? 1 : 0,
        completeSteps > 0 ? 1 : 0
      ];
      
      const score = scores.reduce((a, b) => a + b, 0);
      const percentage = Math.round((score / scores.length) * 100);
      
      let rating = '❌ Poor';
      if (percentage >= 80) rating = '✅ Excellent';
      else if (percentage >= 60) rating = '⭐ Good';
      else if (percentage >= 40) rating = '⚠️  Fair';
      
      console.log(`\n🎯 Quality Score: ${percentage}% - ${rating}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Review complete!\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reviewStrategies();

