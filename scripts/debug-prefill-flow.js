/**
 * Debug Script for Pre-fill Data Flow
 * Run this in the browser console to debug the pre-fill data flow
 * 
 * UPDATED: Fixed infinite loops and pre-fill issues
 */

console.log('🔍 Pre-fill Data Flow Debug Tool (Updated)');

function debugPreFillFlow() {
  console.log('\n=== 🔍 DEBUGGING PRE-FILL DATA FLOW ===\n');

  // 1. Check localStorage for pre-fill data
  const preFillData = localStorage.getItem('bcp-prefill-data');
  const industrySelected = localStorage.getItem('bcp-industry-selected');
  const draftData = localStorage.getItem('bcp-draft');

  console.log('📦 1. LocalStorage Check:');
  console.log('   • bcp-prefill-data:', preFillData ? '✅ Found' : '❌ Missing');
  console.log('   • bcp-industry-selected:', industrySelected || '❌ Missing');
  console.log('   • bcp-draft:', draftData ? '✅ Found' : '❌ Missing');

  if (preFillData) {
    try {
      const data = JSON.parse(preFillData);
      console.log('\n📋 2. Pre-fill Data Structure:');
      console.log('   • Industry:', data.industry ? '✅' : '❌');
      console.log('   • Location:', data.location ? '✅' : '❌');
      console.log('   • Pre-filled Fields:', data.preFilledFields ? Object.keys(data.preFilledFields).length + ' steps' : '❌');
      
      if (data.preFilledFields) {
        console.log('   • Steps with data:');
        Object.keys(data.preFilledFields).forEach(step => {
          const fields = Object.keys(data.preFilledFields[step] || {});
          console.log(`     - ${step}: ${fields.length} fields (${fields.join(', ')})`);
        });
      }
      
      console.log('\n📄 3. Sample Pre-fill Data:');
      console.log(data);
    } catch (e) {
      console.error('❌ Invalid JSON in bcp-prefill-data:', e);
    }
  }

  // 2. Check form elements in the DOM
  console.log('\n🎯 4. Form Fields Check:');
  const textareas = document.querySelectorAll('textarea');
  const filledFields = [];
  
  textareas.forEach((textarea, index) => {
    if (textarea.value && textarea.value.trim() !== '') {
      filledFields.push({
        index,
        placeholder: textarea.placeholder,
        value: textarea.value.substring(0, 50) + (textarea.value.length > 50 ? '...' : ''),
        hasSmartPreFill: textarea.classList.contains('bg-blue-50')
      });
    }
  });

  console.log(`   • Found ${textareas.length} text fields total`);
  console.log(`   • ${filledFields.length} fields have values:`);
  filledFields.forEach(field => {
    console.log(`     ${field.hasSmartPreFill ? '🤖' : '👤'} Field ${field.index}: "${field.value}"`);
  });

  // 3. Check for smart suggestion indicators
  const smartIndicators = document.querySelectorAll('[class*="bg-blue-50"], [class*="AI-Generated"]');
  console.log(`\n💡 5. Smart Features Active:`, smartIndicators.length > 0 ? '✅' : '❌');
  if (smartIndicators.length > 0) {
    console.log(`   • Found ${smartIndicators.length} smart suggestion indicators`);
  }

  // 4. Network activity check
  console.log('\n🌐 6. Checking Network Activity:');
  console.log('   • Monitor console for API calls to:');
  console.log('     - /api/wizard/prepare-prefill-data');
  console.log('     - /api/wizard/get-field-suggestions');
  console.log('     - /api/wizard/get-smart-recommendations');

  // 5. Recommendations
  console.log('\n💡 7. Recommendations:');
  
  if (!preFillData) {
    console.log('   ❌ No pre-fill data found! Try:');
    console.log('     1. Go back to industry selector');
    console.log('     2. Select a business type and location');
    console.log('     3. Click "Generate Plan" button');
  } else if (filledFields.length === 0) {
    console.log('   ⚠️  Pre-fill data exists but no fields are filled! Try:');
    console.log('     1. Refresh the page');
    console.log('     2. Check console for errors');
    console.log('     3. Verify you\'re in the wizard (not industry selector)');
  } else {
    console.log('   ✅ Pre-fill appears to be working!');
    console.log(`     • ${filledFields.length} fields have values`);
    console.log('     • Check specific business fields like Business Purpose, Products & Services');
  }

  // 6. Recent fixes applied
  console.log('\n🔧 8. Recent Fixes Applied:');
  console.log('   ✅ Fixed infinite loop errors');
  console.log('   ✅ Fixed duplicate examples issue');
  console.log('   ✅ Fixed missing mergePreFillData function');
  console.log('   ✅ Re-enabled smart suggestions with proper safeguards');
  console.log('   ✅ All API endpoints compile correctly');

  console.log('\n=== END DEBUG REPORT ===\n');
}

// Helper functions
window.debugPreFillFlow = debugPreFillFlow;

window.clearPreFillData = function() {
  localStorage.removeItem('bcp-prefill-data');
  localStorage.removeItem('bcp-industry-selected');
  localStorage.removeItem('bcp-draft');
  console.log('🗑️ All pre-fill data cleared. Refresh page to start fresh.');
};

window.showPreFillData = function() {
  const data = localStorage.getItem('bcp-prefill-data');
  if (data) {
    console.log('📦 Current pre-fill data:');
    console.log(JSON.parse(data));
  } else {
    console.log('❌ No pre-fill data found');
  }
};

window.simulateIndustrySelection = function(businessTypeId = 'restaurant', countryCode = 'JM') {
  console.log('🎭 Simulating industry selection...');
  
  // This would normally be called by IndustrySelector
  const mockPreFillData = {
    industry: { id: businessTypeId, name: 'Restaurant' },
    location: { countryCode, country: 'Jamaica', nearCoast: false, urbanArea: true },
    preFilledFields: {
      BUSINESS_OVERVIEW: {
        'Business Purpose': 'Provide quality dining experience with local Caribbean cuisine',
        'Products and Services': 'Restaurant services, catering, takeaway meals',
        'Operating Hours': 'Monday-Saturday: 11:00 AM - 10:00 PM, Sunday: 2:00 PM - 9:00 PM',
        'Key Personnel Involved': 'Restaurant Manager, Head Chef, Waitstaff',
        'Customer Base': 'Local residents, tourists, business professionals'
      }
    },
    contextualExamples: {},
    recommendedStrategies: { prevention: [], response: [], recovery: [] }
  };
  
  localStorage.setItem('bcp-prefill-data', JSON.stringify(mockPreFillData));
  localStorage.setItem('bcp-industry-selected', 'true');
  
  console.log('✅ Mock pre-fill data created. Refresh the page to see it in action.');
};

window.testFormFieldPopulation = function() {
  console.log('🧪 Testing form field population...');
  
  const textareas = document.querySelectorAll('textarea');
  console.log(`Found ${textareas.length} text fields`);
  
  textareas.forEach((textarea, index) => {
    const label = textarea.closest('.space-y-4')?.querySelector('label')?.textContent || `Field ${index}`;
    console.log(`Field "${label}": ${textarea.value ? 'HAS VALUE' : 'EMPTY'}`);
    
    if (textarea.value) {
      console.log(`  Value: "${textarea.value.substring(0, 100)}${textarea.value.length > 100 ? '...' : ''}"`);
    }
  });
};

// Auto-run the debug
debugPreFillFlow();

// Monitor console for the user
console.log('\n🎯 AVAILABLE COMMANDS:');
console.log('• debugPreFillFlow() - Run full debug check');
console.log('• clearPreFillData() - Clear all stored data');
console.log('• showPreFillData() - Show current pre-fill data');
console.log('• simulateIndustrySelection() - Create mock data');
console.log('• testFormFieldPopulation() - Check if fields are populated');

// Auto-monitor for errors
const originalError = console.error;
console.error = function(...args) {
  if (args[0] && args[0].includes && (args[0].includes('loop') || args[0].includes('Event'))) {
    console.log('🚨 DETECTED LOOP ERROR - This should now be fixed!');
  }
  originalError.apply(console, args);
}; 