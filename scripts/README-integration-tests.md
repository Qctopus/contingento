# Admin-Wizard Integration Tests

This comprehensive test suite validates that the admin system properly integrates with the user-facing wizard, ensuring all data flows, API endpoints, and edge cases work correctly.

## What It Tests

### 1. Data Flow Integration
- ✅ Complete user journey from business type selection to pre-fill data generation
- ✅ Risk calculation consistency between admin data and wizard APIs
- ✅ Strategy recommendation accuracy based on business type and location

### 2. API Endpoint Validation
- ✅ `/api/wizard/get-smart-recommendations` - Business-specific risk analysis
- ✅ `/api/wizard/get-risk-calculations` - Pre-calculated risk assessments  
- ✅ `/api/wizard/get-field-suggestions` - Contextual form examples
- ✅ `/api/wizard/prepare-prefill-data` - Comprehensive pre-fill packages
- ✅ All admin APIs (`/api/admin/*`) - Data availability and structure

### 3. Edge Cases
- ✅ Invalid business type IDs
- ✅ Missing required parameters
- ✅ Inactive business types and locations
- ✅ Unknown or incomplete location data
- ✅ Graceful degradation when admin data is missing

### 4. Seasonal Variations
- ✅ Hurricane season detection (June-November)
- ✅ Off-season risk level adjustments
- ✅ Seasonal risk activation/deactivation

### 5. Performance Testing
- ✅ API response time validation (< 2s per call)
- ✅ Concurrent request handling (10 simultaneous requests)
- ✅ Performance regression detection

## Reports Generated

### Business Type Completeness Report
Shows which business types have complete admin configuration:
- Description and examples
- Hazard mappings
- Strategy links
- Missing field identification

### Location Configuration Report  
Analyzes location data completeness:
- Active locations
- Hazard mappings per location
- Coverage gaps

### Coverage Analysis
Overall system configuration status:
- Business type configuration percentage
- Hazard mapping coverage
- Strategy linking completeness
- Identified gaps and recommendations

### Deployment Readiness Score
Calculates if the system is ready for production:
- Critical failure detection
- Performance assessment  
- Configuration completeness
- Specific recommendations for improvement

## Running the Tests

### Prerequisites
```bash
# Ensure the database is running and accessible
npm run dev  # or your database start command

# Install tsx if not already installed
npm install -g tsx
# OR
npm install --save-dev tsx
```

### Quick Run
```bash
# From project root
node scripts/run-integration-tests.js
```

### Manual Run (Advanced)
```bash
# Run with tsx directly
npx tsx scripts/test-wizard-integration.ts

# With custom base URL
BASE_URL=http://localhost:3001 npx tsx scripts/test-wizard-integration.ts
```

### Adding to package.json
Add this script to your `package.json`:
```json
{
  "scripts": {
    "test:integration": "node scripts/run-integration-tests.js",
    "test:wizard": "BASE_URL=http://localhost:3000 npx tsx scripts/test-wizard-integration.ts"
  }
}
```

Then run with:
```bash
npm run test:integration
```

## Understanding the Output

### Test Results
```
✅ Admin Business Types Exist
✅ GET Smart Recommendations API  
✅ Complete User Journey Flow
⚠️ Limited Business Types: Only 3 business types configured
❌ API Response Times: Average response time too slow: 2500ms
```

### Deployment Readiness
```
🚀 DEPLOYMENT READINESS
Overall Score: 85%
Status: NEEDS IMPROVEMENT

💡 RECOMMENDATIONS
- Configure more business types for better coverage
- Optimize API response times
- Map more hazards to business types
```

### Detailed Reports
Full JSON reports are saved to `test-results/wizard-integration-YYYY-MM-DD.json` for detailed analysis.

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Integration Tests
on: [push, pull_request]
jobs:
  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run test:integration
```

### Pre-deployment Check
```bash
#!/bin/bash
# Run before deploying to production
npm run test:integration

if [ $? -eq 0 ]; then
  echo "✅ Integration tests passed - proceeding with deployment"
  # Your deployment commands here
else
  echo "❌ Integration tests failed - deployment blocked"
  exit 1
fi
```

## Customization

### Adding New Tests
1. Open `scripts/test-wizard-integration.ts`
2. Add your test method to the `WizardIntegrationTester` class
3. Call it from `runAllTests()`
4. Follow the existing pattern for error handling and reporting

### Test Configuration
Modify these constants in the script:
```typescript
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const TEST_TIMEOUT = 30000 // 30 seconds
```

### Custom Reports
Extend the report interfaces and generation methods to include additional metrics specific to your needs.

## Troubleshooting

### Common Issues
1. **Database Connection Errors**: Ensure your database is running and accessible
2. **Missing tsx**: Install with `npm install -g tsx` or `npm install --save-dev tsx`  
3. **API Endpoint Failures**: Verify your Next.js development server is running
4. **Permission Errors**: Make sure the scripts have execute permissions

### Debug Mode
Set `NODE_ENV=development` for more verbose logging:
```bash
NODE_ENV=development npm run test:integration
```

## Best Practices

1. **Run Before Every Deployment**: Ensure integration integrity
2. **Monitor Trends**: Track performance and coverage over time
3. **Fix Warnings**: Address warnings before they become failures
4. **Update Tests**: Keep tests current with API changes
5. **Review Reports**: Use generated reports to guide admin data improvements

This test suite is designed to catch integration issues early and ensure a reliable user experience across all admin-wizard interactions. 