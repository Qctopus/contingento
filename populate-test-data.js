// Business Continuity Plan - Test Data Population Script
// Run this in the browser console to populate all form fields for testing

(() => {
  console.log('🧪 Starting BCP Test Data Population...');

  // Complete test data for all form steps
  const testData = {
    PLAN_INFORMATION: {
      'Company Name': 'Island Paradise Restaurant Ltd.',
      'Plan Manager': 'Maria Santos, General Manager',
      'Alternate Manager': 'Carlos Rodriguez, Assistant Manager',
      'Date of Preparation': '2024-01-15',
      'Plan Review Date': '2024-06-15',
      'Plan Effective Date': '2024-02-01'
    },

    BUSINESS_OVERVIEW: {
      'Business License Number': 'BL-2023-4567',
      'Business Purpose': 'To serve authentic Caribbean cuisine and provide a memorable dining experience for both locals and tourists in Bridgetown',
      'Products and Services': 'Full-service restaurant offering traditional Barbadian dishes, fresh seafood, craft cocktails, and catering services. Specializing in flying fish, cou-cou, and rum punch with live calypso music on weekends',
      'Service Delivery Methods': 'Dine-in restaurant with 80 seats, takeout counter, delivery service within 5-mile radius, and off-site catering for events up to 200 people',
      'Operating Hours': 'Tuesday-Sunday 11:00 AM - 10:00 PM, Closed Mondays. Extended hours during tourist season (December-April) until 11:00 PM',
      'Key Personnel Involved': 'Head Chef (Maria Santos), Sous Chef (James Wilson), 3 Kitchen Staff, 4 Servers, 2 Bartenders, 1 Manager, 1 Cleaning Staff',
      'Minimum Resource Requirements': '1 Chef, 2 Kitchen staff, 2 Servers, Basic kitchen equipment, POS system, 30-seat capacity, Core menu ingredients',
      'Customer Base': 'Local residents (40%), Tourists staying in nearby hotels (45%), Special events and catering clients (15%)',
      'Service Provider BCP Status': 'partial'
    },

    ESSENTIAL_FUNCTIONS: {
      'Business Functions': [
        {
          'Business Function': 'Food Preparation and Service',
          'Description': 'Preparing and serving meals to customers in dining room and for takeout',
          'Priority Level': 'critical',
          'Maximum Acceptable Downtime': '0-4 hours',
          'Critical Resources Needed': 'Head Chef, Kitchen equipment, Fresh ingredients, POS system'
        },
        {
          'Business Function': 'Customer Service and Reservations',
          'Description': 'Taking orders, serving customers, managing reservations and payments',
          'Priority Level': 'high',
          'Maximum Acceptable Downtime': '4-8 hours',
          'Critical Resources Needed': 'Wait staff, POS system, Phone/internet, Reservation system'
        },
        {
          'Business Function': 'Inventory and Supply Management',
          'Description': 'Managing food inventory, ordering supplies, receiving deliveries',
          'Priority Level': 'medium',
          'Maximum Acceptable Downtime': '1-2 days',
          'Critical Resources Needed': 'Manager, Supplier contacts, Storage facilities, Delivery access'
        },
        {
          'Business Function': 'Financial Management',
          'Description': 'Processing payments, banking, payroll, accounting',
          'Priority Level': 'medium',
          'Maximum Acceptable Downtime': '2-3 days',
          'Critical Resources Needed': 'Manager, Computer, Internet, Banking access, Records'
        }
      ]
    },

    RISK_ASSESSMENT: {
      'Potential Hazards': ['hurricane', 'power_outage', 'flash_flood', 'fire', 'supply_disruption', 'staff_unavailable', 'economic_downturn'],
      'Risk Assessment Matrix': [
        {
          hazard: 'Hurricane/Tropical Storm',
          likelihood: '3',
          severity: '4',
          riskLevel: 'High',
          riskScore: 12,
          planningMeasures: 'Install storm shutters, secure outdoor furniture, maintain 3-day emergency supply kit, establish communication plan with staff'
        },
        {
          hazard: 'Extended Power Outage',
          likelihood: '4',
          severity: '3',
          riskLevel: 'High',
          riskScore: 12,
          planningMeasures: 'Install backup generator for kitchen equipment, maintain battery-powered emergency lighting, arrange agreement with nearby restaurant for temporary kitchen use'
        },
        {
          hazard: 'Flash Flooding',
          likelihood: '2',
          severity: '3',
          riskLevel: 'Medium',
          riskScore: 6,
          planningMeasures: 'Elevate important equipment, maintain sandbags, identify alternate access routes, waterproof critical documents'
        },
        {
          hazard: 'Fire',
          likelihood: '2',
          severity: '4',
          riskLevel: 'Medium',
          riskScore: 8,
          planningMeasures: 'Regular fire safety inspections, staff fire safety training, maintain fire extinguishers and smoke detectors, establish evacuation procedures'
        },
        {
          hazard: 'Supply Chain Disruption',
          likelihood: '3',
          severity: '2',
          riskLevel: 'Medium',
          riskScore: 6,
          planningMeasures: 'Maintain relationships with multiple suppliers, keep 1-week inventory buffer, develop simplified menu for emergencies'
        }
      ]
    },

    STRATEGIES: {
      'Prevention Strategies': [
        'Conduct monthly equipment maintenance checks and safety inspections',
        'Maintain emergency fund equal to 2 months operating expenses',
        'Cross-train staff in multiple roles to ensure coverage during absences',
        'Establish relationships with backup suppliers for critical ingredients',
        'Install and maintain fire suppression system and security cameras'
      ],
      'Response Strategies': [
        'Implement emergency communication tree to contact all staff within 2 hours',
        'Activate backup generator and emergency lighting systems',
        'Switch to simplified emergency menu using shelf-stable ingredients',
        'Coordinate with local emergency services and follow evacuation procedures',
        'Implement remote work for administrative tasks where possible'
      ],
      'Recovery Strategies': [
        'Assess facility damage and coordinate with insurance company for claims',
        'Arrange temporary kitchen space with partner restaurant if needed',
        'Communicate with customers via social media about reopening timeline',
        'Gradually restore full menu and services as supply chains normalize',
        'Conduct post-incident review and update emergency procedures'
      ],
      'Long-term Risk Reduction': 'Annual review of emergency procedures with staff training, quarterly testing of backup systems, ongoing relationship building with suppliers and community partners, continuous monitoring of weather and economic conditions'
    },

    ACTION_PLAN: {
      'Emergency Response Team': [
        {
          'Name': 'Maria Santos',
          'Role': 'Incident Commander',
          'Responsibilities': 'Overall coordination, decision making, external communications',
          'Contact Information': '246-555-0123, maria@islandparadise.bb',
          'Backup Person': 'Carlos Rodriguez'
        },
        {
          'Name': 'Carlos Rodriguez',
          'Role': 'Operations Coordinator',
          'Responsibilities': 'Staff coordination, facility assessment, supply management',
          'Contact Information': '246-555-0124, carlos@islandparadise.bb',
          'Backup Person': 'James Wilson'
        },
        {
          'Name': 'James Wilson',
          'Role': 'Safety Officer',
          'Responsibilities': 'Staff safety, evacuation procedures, first aid',
          'Contact Information': '246-555-0125, james@islandparadise.bb',
          'Backup Person': 'Maria Santos'
        }
      ],
      'Communication Plan': [
        {
          'Audience': 'All Staff',
          'Key Messages': 'Safety status, work instructions, reporting location',
          'Communication Method': 'WhatsApp group, Phone tree',
          'Frequency': 'Immediate, then every 4 hours',
          'Responsible Person': 'Carlos Rodriguez'
        },
        {
          'Audience': 'Customers',
          'Key Messages': 'Service status, reopening timeline, alternative arrangements',
          'Communication Method': 'Facebook, Instagram, Website banner',
          'Frequency': 'Within 2 hours, daily updates',
          'Responsible Person': 'Maria Santos'
        },
        {
          'Audience': 'Suppliers',
          'Key Messages': 'Delivery status, alternate arrangements, damage assessment',
          'Communication Method': 'Phone calls, Email',
          'Frequency': 'Within 6 hours',
          'Responsible Person': 'Carlos Rodriguez'
        }
      ],
      'Resource Requirements': [
        {
          'Resource Type': 'Personnel',
          'Resource Details': 'Minimum 4 staff: 1 Chef, 1 Server, 1 Manager, 1 Support',
          'Estimated Cost': '$800 per day',
          'Procurement Method': 'Existing staff, temporary agency if needed',
          'Critical Dependencies': 'Staff availability, transportation access'
        },
        {
          'Resource Type': 'Equipment',
          'Resource Details': 'Backup generator, Emergency lighting, Basic kitchen equipment',
          'Estimated Cost': '$2,500 initial, $200/month maintenance',
          'Procurement Method': 'Purchase/lease from equipment supplier',
          'Critical Dependencies': 'Electrical connections, fuel supply'
        },
        {
          'Resource Type': 'Supplies',
          'Resource Details': '1-week food inventory, Cleaning supplies, First aid kit',
          'Estimated Cost': '$1,200 per week',
          'Procurement Method': 'Emergency suppliers, bulk purchasing',
          'Critical Dependencies': 'Supply chain access, storage capacity'
        }
      ],
      'Testing and Assessment Plan': [
        {
          'Test Type': 'Communication Test',
          'Frequency': 'Monthly',
          'Participants': 'All staff',
          'Success Criteria': 'All staff respond within 2 hours',
          'Responsible Person': 'Carlos Rodriguez'
        },
        {
          'Test Type': 'Evacuation Drill',
          'Frequency': 'Quarterly',
          'Participants': 'All staff and customers present',
          'Success Criteria': 'Building evacuated within 3 minutes',
          'Responsible Person': 'James Wilson'
        },
        {
          'Test Type': 'Generator Test',
          'Frequency': 'Monthly',
          'Participants': 'Maintenance staff',
          'Success Criteria': 'Generator starts and runs for 30 minutes',
          'Responsible Person': 'Maria Santos'
        }
      ]
    },

    CONTACTS_AND_INFORMATION: {
      'Staff Contact Information': [
        {
          'Name': 'Maria Santos',
          'Position': 'General Manager',
          'Phone Number': '246-555-0123',
          'Email Address': 'maria@islandparadise.bb',
          'Emergency Contact': 'Husband: 246-555-0130'
        },
        {
          'Name': 'Carlos Rodriguez',
          'Position': 'Assistant Manager',
          'Phone Number': '246-555-0124',
          'Email Address': 'carlos@islandparadise.bb',
          'Emergency Contact': 'Wife: 246-555-0131'
        },
        {
          'Name': 'James Wilson',
          'Position': 'Head Chef',
          'Phone Number': '246-555-0125',
          'Email Address': 'james@islandparadise.bb',
          'Emergency Contact': 'Sister: 246-555-0132'
        }
      ],
      'Key Customer Contacts': [
        {
          'Customer Name': 'Sunset Resort',
          'Type/Notes': 'Weekly catering contract',
          'Phone Number': '246-555-0140',
          'Email Address': 'events@sunsetresort.bb',
          'Special Requirements': 'Advance notice for cancellations'
        },
        {
          'Customer Name': 'Johnson Family',
          'Type/Notes': 'Regular elderly customers - home delivery',
          'Phone Number': '246-555-0141',
          'Email Address': '',
          'Special Requirements': 'Weekly delivery every Wednesday'
        }
      ],
      'Supplier Information': [
        {
          'Supplier Name': 'Caribbean Fresh Foods',
          'Goods/Services Supplied': 'Fresh produce and seafood',
          'Phone Number': '246-555-0150',
          'Email Address': 'orders@caribbeanfresh.bb',
          'Backup Supplier': 'Island Foods Ltd'
        },
        {
          'Supplier Name': 'Banks Beer Distributors',
          'Goods/Services Supplied': 'Beverages and bar supplies',
          'Phone Number': '246-555-0151',
          'Email Address': 'sales@banksbeerdist.bb',
          'Backup Supplier': 'Mount Gay Rum Co.'
        }
      ],
      'Emergency Services and Utilities': [
        {
          'Service Type': 'Police',
          'Organization Name': 'Royal Barbados Police Force',
          'Phone Number': '211 / 246-430-7100',
          'Email Address': '',
          'Account Number': 'N/A'
        },
        {
          'Service Type': 'Fire Department',
          'Organization Name': 'Barbados Fire Service',
          'Phone Number': '311 / 246-430-7000',
          'Email Address': '',
          'Account Number': 'N/A'
        },
        {
          'Service Type': 'Electricity',
          'Organization Name': 'Barbados Light & Power',
          'Phone Number': '246-627-5555',
          'Email Address': 'customer.service@blpc.com.bb',
          'Account Number': 'BLP-789012'
        },
        {
          'Service Type': 'Water',
          'Organization Name': 'Barbados Water Authority',
          'Phone Number': '246-434-4444',
          'Email Address': 'info@bwa.bb',
          'Account Number': 'BWA-345678'
        }
      ],
      'Critical Business Information': 'Business License: BL-2023-4567, Insurance Policy: Guardian Life GL-891234, Bank Account: FirstCaribbean #567890123, Food Handler Permits: Current through Dec 2024, Liquor License: LL-2023-0456. Critical documents stored in fireproof safe in manager office. Digital backups on Google Drive account shared with accountant.',
      'Plan Distribution List': [
        {
          'Name/Position': 'Maria Santos (Manager)',
          'Format Received': 'Electronic + Hard copy',
          'Date Provided': '2024-01-15',
          'Version Number': 'Version 1.0',
          'Acknowledgment': 'Signed'
        },
        {
          'Name/Position': 'Carlos Rodriguez (Assistant Manager)',
          'Format Received': 'Electronic',
          'Date Provided': '2024-01-15',
          'Version Number': 'Version 1.0',
          'Acknowledgment': 'Email confirmed'
        }
      ]
    },

    TESTING_AND_MAINTENANCE: {
      'Plan Testing Schedule': [
        {
          'Test Type': 'Communication Test',
          'What is Tested': 'Emergency contact procedures and staff notification system',
          'Frequency': 'Monthly',
          'Next Test Date': '2024-02-15',
          'Responsible Person': 'Carlos Rodriguez'
        },
        {
          'Test Type': 'Equipment Test',
          'What is Tested': 'Backup generator and emergency lighting systems',
          'Frequency': 'Monthly',
          'Next Test Date': '2024-02-20',
          'Responsible Person': 'James Wilson'
        },
        {
          'Test Type': 'Evacuation Drill',
          'What is Tested': 'Emergency evacuation procedures for staff and customers',
          'Frequency': 'Quarterly',
          'Next Test Date': '2024-04-15',
          'Responsible Person': 'Maria Santos'
        }
      ],
      'Plan Maintenance Schedule': [
        {
          'Maintenance Activity': 'Review and update contact information',
          'Frequency': 'Monthly',
          'Next Due Date': '2024-02-01',
          'Responsible Person': 'Carlos Rodriguez',
          'Completion Status': 'pending'
        },
        {
          'Maintenance Activity': 'Review supplier agreements and backup options',
          'Frequency': 'Quarterly',
          'Next Due Date': '2024-04-01',
          'Responsible Person': 'Maria Santos',
          'Completion Status': 'pending'
        },
        {
          'Maintenance Activity': 'Full plan review and update',
          'Frequency': 'Annually',
          'Next Due Date': '2024-12-15',
          'Responsible Person': 'Maria Santos',
          'Completion Status': 'pending'
        }
      ],
      'Training Schedule': [
        {
          'Training Topic': 'Basic emergency response procedures',
          'Target Audience': 'All staff',
          'Frequency': 'Quarterly',
          'Next Training Date': '2024-03-15',
          'Trainer/Method': 'Manager-led session with printed materials'
        },
        {
          'Training Topic': 'Fire safety and evacuation procedures',
          'Target Audience': 'All staff',
          'Frequency': 'Semi-annually',
          'Next Training Date': '2024-06-15',
          'Trainer/Method': 'Fire department demonstration'
        }
      ],
      'Document Update Log': [
        {
          'Update Date': '2024-01-15',
          'Section Updated': 'Initial plan creation',
          'Changes Made': 'Complete business continuity plan developed',
          'Updated By': 'Maria Santos',
          'Reason for Update': 'new_plan'
        }
      ]
    }
  };

  // Function to set form field values
  function setFormField(selector, value, type = 'input') {
    // Handle checkboxes specially
    if (type === 'checkbox' && Array.isArray(value)) {
      let found = false;
      value.forEach(val => {
        const checkbox = document.querySelector(`input[type="checkbox"][value="${val}"]`);
        if (checkbox) {
          checkbox.checked = true;
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
          found = true;
        }
      });
      return found;
    }
    
    // Return false for empty/null selectors
    if (!selector || selector.trim() === '') {
      return false;
    }
    
    try {
      const element = document.querySelector(selector);
      if (element) {
        if (type === 'input' || type === 'textarea') {
          element.value = value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (type === 'select') {
          element.value = value;
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return true;
      }
    } catch (error) {
      console.log(`⚠️  Invalid selector: ${selector}`);
    }
    return false;
  }

  // Function to populate table data
  function populateTable(tableData, stepKey) {
    console.log(`📋 Populating table data for ${stepKey}...`);
    
    // Look for "Add Row" buttons and click them to create enough rows
    if (Array.isArray(tableData)) {
      const addRowButtons = document.querySelectorAll('button[type="button"]');
      const addButton = Array.from(addRowButtons).find(btn => btn.textContent.includes('Add Row'));
      
      // Add rows if needed
      for (let i = 0; i < tableData.length - 1; i++) {
        if (addButton) {
          addButton.click();
          // Small delay to let DOM update
          setTimeout(() => {}, 100);
        }
      }
      
      // Populate the table rows
      setTimeout(() => {
        tableData.forEach((rowData, rowIndex) => {
          Object.entries(rowData).forEach(([columnName, cellValue]) => {
                         // Try different selectors for table inputs
             const selectors = [
               `tr:nth-of-type(${rowIndex + 1}) input[placeholder*="${columnName}"]`,
               `tr:nth-of-type(${rowIndex + 1}) textarea[placeholder*="${columnName}"]`,
               `tr:nth-of-type(${rowIndex + 1}) select`,
               `input[name*="${columnName}"][data-row="${rowIndex}"]`,
               `textarea[name*="${columnName}"][data-row="${rowIndex}"]`
             ].filter(s => s && s.trim() !== ''); // Filter out empty selectors
             
             let found = false;
             for (const selector of selectors) {
               if (selector && setFormField(selector, cellValue, 'input')) {
                 found = true;
                 break;
               }
             }
            
            if (!found) {
              console.log(`⚠️  Could not find field for ${columnName} in row ${rowIndex}`);
            }
          });
        });
      }, 500);
    }
  }

  // Main population function
  function populateAllFields() {
    console.log('📝 Starting to populate all form fields...');
    
    // Populate basic text fields for current step
    Object.entries(testData).forEach(([stepKey, stepData]) => {
             Object.entries(stepData).forEach(([fieldName, fieldValue]) => {
         if (Array.isArray(fieldValue) && fieldName !== 'Potential Hazards' && fieldName !== 'Risk Assessment Matrix') {
           // Handle table data
           populateTable(fieldValue, stepKey);
         } else if (fieldName === 'Potential Hazards') {
           // Handle checkbox selection for hazards
           setFormField('', fieldValue, 'checkbox');
         } else if (fieldName === 'Risk Assessment Matrix') {
           // Skip risk assessment matrix - it's complex and should be handled separately
           console.log(`📊 Skipping Risk Assessment Matrix - too complex for auto-population`);
           return;
                 } else if (typeof fieldValue === 'string') {
           // Handle regular text fields
           const selectors = [
             `input[placeholder*="${fieldName}"]`,
             `textarea[placeholder*="${fieldName}"]`,
             `input[aria-label*="${fieldName}"]`,
             `textarea[aria-label*="${fieldName}"]`,
             `input[name*="${fieldName.replace(/\s+/g, '_')}"]`,
             `textarea[name*="${fieldName.replace(/\s+/g, '_')}"]`,
             `select[name*="${fieldName.replace(/\s+/g, '_')}"]`
           ].filter(s => s && s.trim() !== ''); // Filter out empty selectors
           
           let found = false;
           for (const selector of selectors) {
             if (selector && setFormField(selector, fieldValue, selector.includes('select') ? 'select' : 'input')) {
               found = true;
               break;
             }
           }
           
           if (!found) {
             console.log(`⚠️  Could not find field: ${fieldName}`);
           }
         }
      });
    });
    
    console.log('✅ Form population complete! You can now test PDF export.');
  }

  // Run the population with a small delay
  setTimeout(populateAllFields, 1000);
  
  // Also expose the function globally for manual use
  window.populateBCPTestData = populateAllFields;
  window.bcpTestData = testData;
  
  console.log('🎯 BCP Test Data Population Script Loaded!');
  console.log('💡 Run window.populateBCPTestData() to populate current step');
  console.log('📊 Access test data via window.bcpTestData');
})(); 