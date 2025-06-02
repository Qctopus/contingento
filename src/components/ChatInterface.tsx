'use client'

import { useState, useRef, useEffect } from 'react'
import { StructuredInput } from './StructuredInput'

interface Message {
  role: 'user' | 'assistant'
  content: string
  structuredInput?: {
    type: 'text' | 'radio' | 'checkbox' | 'table' | 'special_risk_matrix'
    label: string
    options?: { label: string; value: string }[]
    required?: boolean
    tableColumns?: string[]
    tableRows?: string[]
    prompt: string
  }
}

const STEPS = {
  BUSINESS_OVERVIEW: {
    title: 'Business Overview',
    description: 'Let\'s start by understanding your business better.',
    inputs: [
      {
        type: 'text' as const,
        label: 'Company Name',
        required: true,
        prompt: 'What is your company name?',
        examples: ['ABC Store', 'Caribbean Delights', 'Island Services Ltd.'],
      },
      {
        type: 'text' as const,
        label: 'Business License Number',
        required: true,
        prompt: 'What is your business license number? This is usually found on your business registration documents.',
        examples: ['BL-12345', 'REG-2023-789'],
      },
      {
        type: 'text' as const,
        label: 'Business Purpose',
        required: true,
        prompt: 'What is the main purpose of your business? Think about why you started this business and what problem it solves for your customers.',
        examples: [
          'To provide fresh local produce to the community',
          'To offer affordable home repair services',
          'To create authentic Caribbean cuisine for tourists and locals',
        ],
      },
      {
        type: 'text' as const,
        label: 'Products and Services',
        required: true,
        prompt: 'What products and services do you provide? What makes your business special or unique? Consider your main offerings and any unique selling points.',
        examples: [
          'We sell fresh fruits, vegetables, and local spices. Our speciality is our homemade hot sauce made from local peppers.',
          'We provide plumbing and electrical services. What makes us special is our 24/7 emergency service and same-day repairs.',
          'We offer authentic Caribbean cuisine with a modern twist. Our speciality is our family recipe for jerk chicken.',
        ],
      },
      {
        type: 'text' as const,
        label: 'Service Delivery',
        required: true,
        prompt: 'How and where do you provide your products and services? Consider your physical location, delivery methods, and any online presence.',
        examples: [
          'We have a physical store in downtown Kingston, and we also deliver to nearby areas. Customers can order through our website or by phone.',
          'We operate from our workshop but provide services at customer locations. We also have a mobile service van for emergency calls.',
          'We have a restaurant in Montego Bay and offer takeout and delivery. We also cater for events and have a food truck for festivals.',
        ],
      },
      {
        type: 'text' as const,
        label: 'Operating Hours',
        required: true,
        prompt: 'What are your operating hours and days? Include any seasonal variations or special hours.',
        examples: [
          'Monday to Saturday, 8 AM to 6 PM. Closed on Sundays and public holidays.',
          '24/7 for emergency services. Regular business hours are Monday to Friday, 9 AM to 5 PM.',
          'Tuesday to Sunday, 11 AM to 10 PM. Extended hours during tourist season (December to April).',
        ],
      },
      {
        type: 'radio' as const,
        label: 'Service Provider BCP',
        required: true,
        prompt: 'Do your service providers (suppliers, vendors, etc.) have business continuity plans in place? This helps us understand your supply chain resilience.',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
          { label: 'Unknown', value: 'unknown' },
        ],
        examples: [
          'Yes - Our main suppliers have shared their BCPs with us',
          'No - We haven\'t asked our suppliers about their BCPs',
          'Unknown - We\'re not sure if our suppliers have BCPs',
        ],
      },
    ],
  },
  ESSENTIAL_FUNCTIONS: {
    title: 'Essential Business Functions',
    description: 'Now, let\'s identify the key functions that keep your business running.',
    inputs: [
      {
        type: 'checkbox' as const,
        label: 'Supply Chain Management',
        prompt: 'Which supply chain management functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Ordering supplies', value: 'ordering_supplies' },
          { label: 'Goods receiving', value: 'goods_receiving' },
          { label: 'Storage/Warehouse', value: 'storage' },
          { label: 'Stocking shelves', value: 'stocking' },
          { label: 'Procurement', value: 'procurement' },
        ],
        examples: [
          'A grocery store might select: Ordering supplies, Goods receiving, Storage/Warehouse, Stocking shelves',
          'A restaurant might select: Ordering supplies, Goods receiving, Storage/Warehouse',
          'A service business might select: Procurement only',
        ],
      },
      {
        type: 'checkbox' as const,
        label: 'Staff',
        prompt: 'Which staff-related functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Recruitment', value: 'recruitment' },
          { label: 'Payroll', value: 'payroll' },
          { label: 'Supervision and Management', value: 'supervision' },
        ],
        examples: [
          'A small shop might select: Payroll, Supervision and Management',
          'A growing business might select all three',
          'A family business might only select: Supervision and Management',
        ],
      },
      {
        type: 'checkbox' as const,
        label: 'Technology',
        prompt: 'Which technology functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Website maintenance', value: 'website' },
          { label: 'Online security provider', value: 'security' },
          { label: 'Internet provider', value: 'internet' },
        ],
        examples: [
          'An online store might select all three',
          'A local shop might only select: Internet provider',
          'A service business might select: Website maintenance, Internet provider',
        ],
      },
      {
        type: 'checkbox' as const,
        label: 'Products/Services',
        prompt: 'Which product/service functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Product Design', value: 'design' },
          { label: 'Production', value: 'production' },
          { label: 'Packing', value: 'packing' },
          { label: 'Transporting product', value: 'transport' },
          { label: 'Service delivery', value: 'service' },
          { label: 'Project design & delivery', value: 'project' },
          { label: 'Project monitoring & evaluation', value: 'monitoring' },
        ],
        examples: [
          'A manufacturing business might select: Product Design, Production, Packing, Transporting product',
          'A service business might select: Service delivery, Project design & delivery, Project monitoring & evaluation',
          'A retail business might select: Packing, Transporting product',
        ],
      },
      {
        type: 'checkbox' as const,
        label: 'Infrastructure/Facilities',
        prompt: 'Which infrastructure and facilities functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Building Access', value: 'access' },
          { label: 'Building maintenance', value: 'maintenance' },
          { label: 'Power', value: 'power' },
          { label: 'Water', value: 'water' },
        ],
        examples: [
          'A restaurant might select all four',
          'An office might select: Building Access, Power, Water',
          'A manufacturing plant might select all four',
        ],
      },
      {
        type: 'checkbox' as const,
        label: 'Sales',
        prompt: 'Which sales functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Advertising', value: 'advertising' },
          { label: 'Sales/Cash management', value: 'sales' },
          { label: 'Online sales', value: 'online' },
          { label: 'Customer service', value: 'customer_service' },
          { label: 'Providing quotations/estimates', value: 'quotations' },
          { label: 'Call centre', value: 'call_centre' },
        ],
        examples: [
          'A retail store might select: Advertising, Sales/Cash management, Customer service',
          'An online business might select: Online sales, Customer service, Call centre',
          'A service business might select: Advertising, Customer service, Providing quotations/estimates',
        ],
      },
      {
        type: 'checkbox' as const,
        label: 'Administration',
        prompt: 'Which administrative functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Appointment bookings', value: 'bookings' },
          { label: 'Accounting', value: 'accounting' },
          { label: 'Payroll', value: 'payroll' },
          { label: 'Licensing/certifications', value: 'licensing' },
          { label: 'Reporting', value: 'reporting' },
          { label: 'Reception/phones', value: 'reception' },
          { label: 'Maintenance of assets/equipment', value: 'assets' },
          { label: 'Record keeping', value: 'records' },
          { label: 'Data entry', value: 'data' },
          { label: 'Security of office/assets', value: 'security' },
        ],
        examples: [
          'A small business might select: Accounting, Payroll, Record keeping',
          'A medical practice might select: Appointment bookings, Reception/phones, Record keeping',
          'A manufacturing business might select: Accounting, Maintenance of assets/equipment, Security of office/assets',
        ],
      },
    ],
  },
  RISK_ASSESSMENT: {
    title: 'Risk Assessment',
    description: 'Let\'s identify potential risks to your business.',
    inputs: [
      {
        type: 'checkbox' as const,
        label: 'Hazards',
        prompt: 'Select all hazards that may apply to your business. Consider both natural and man-made risks.',
        options: [
          { label: 'Earthquake', value: 'earthquake' },
          { label: 'Hurricane', value: 'hurricane' },
          { label: 'Coastal Flood', value: 'coastal_flood' },
          { label: 'Flood', value: 'flood' },
          { label: 'Landslide', value: 'landslide' },
          { label: 'Tsunami', value: 'tsunami' },
          { label: 'Epidemics', value: 'epidemics' },
          { label: 'Pandemics', value: 'pandemics' },
          { label: 'Volcanic activity', value: 'volcanic' },
          { label: 'Power outage', value: 'power_outage' },
          { label: 'Cyber Crime', value: 'cyber_crime' },
          { label: 'Terrorism', value: 'terrorism' },
          { label: 'Civil Disorder', value: 'civil_disorder' },
          { label: 'Crime/Theft', value: 'crime' },
          { label: 'Fire', value: 'fire' },
          { label: 'Drought', value: 'drought' },
        ],
        examples: [
          'A coastal business might select: Hurricane, Coastal Flood, Tsunami',
          'A technology business might select: Power outage, Cyber Crime',
          'A retail business might select: Crime/Theft, Fire, Power outage',
        ],
      },
    ],
  },
  STRATEGIES: {
    title: 'Business Continuity Strategies',
    description: 'Now, let\'s develop strategies to protect your business from the identified risks.',
    inputs: [
      {
        type: 'checkbox' as const,
        label: 'Prevention Strategies',
        prompt: 'Which prevention strategies would you like to implement? Select all that apply.',
        options: [
          { label: 'Regular maintenance of equipment and facilities', value: 'maintenance' },
          { label: 'Security systems and protocols', value: 'security' },
          { label: 'Data backup and recovery systems', value: 'data_backup' },
          { label: 'Employee training and awareness programs', value: 'training' },
          { label: 'Insurance coverage review and updates', value: 'insurance' },
          { label: 'Supplier diversity and backup suppliers', value: 'supplier_diversity' },
        ],
        examples: [
          'A retail store might select: Security systems, Employee training, Insurance coverage',
          'A technology business might select: Data backup, Employee training, Supplier diversity',
          'A manufacturing business might select: Regular maintenance, Security systems, Employee training',
        ],
      },
      {
        type: 'checkbox' as const,
        label: 'Response Strategies',
        prompt: 'Which response strategies would you like to implement? Select all that apply.',
        options: [
          { label: 'Emergency response team', value: 'emergency_team' },
          { label: 'Communication plan for stakeholders', value: 'communication' },
          { label: 'Alternative work locations', value: 'alt_location' },
          { label: 'Remote work capabilities', value: 'remote_work' },
          { label: 'Inventory management system', value: 'inventory' },
          { label: 'Customer service continuity plan', value: 'customer_service' },
        ],
        examples: [
          'A service business might select: Communication plan, Remote work capabilities, Customer service plan',
          'A retail business might select: Emergency response team, Communication plan, Inventory management',
          'A manufacturing business might select: Emergency response team, Alternative work locations, Inventory management',
        ],
      },
      {
        type: 'checkbox' as const,
        label: 'Recovery Strategies',
        prompt: 'Which recovery strategies would you like to implement? Select all that apply.',
        options: [
          { label: 'Financial recovery plan', value: 'financial' },
          { label: 'Business resumption procedures', value: 'resumption' },
          { label: 'Employee support programs', value: 'employee_support' },
          { label: 'Customer retention strategies', value: 'customer_retention' },
          { label: 'Supplier relationship management', value: 'supplier_management' },
          { label: 'Marketing and public relations plan', value: 'marketing' },
        ],
        examples: [
          'A small business might select: Financial recovery plan, Business resumption procedures, Customer retention',
          'A service business might select: Employee support programs, Customer retention, Marketing plan',
          'A manufacturing business might select: Financial recovery, Business resumption, Supplier management',
        ],
      },
    ],
  },
  ACTION_PLAN: {
    title: 'Action Plan',
    description: 'Finally, let\'s create a detailed action plan to implement your business continuity strategies.',
    inputs: [
      {
        type: 'text' as const,
        label: 'Implementation Timeline',
        required: true,
        prompt: 'When would you like to start implementing your business continuity plan? Consider any upcoming risks or business cycles.',
        examples: [
          'Start immediately with high-priority items, complete full implementation within 3 months',
          'Begin with critical systems next month, phase in remaining items over 6 months',
          'Start after the busy season ends, implement over 4 months',
        ],
      },
      {
        type: 'text' as const,
        label: 'Resource Requirements',
        required: true,
        prompt: 'What resources (financial, human, technical) will you need to implement your plan?',
        examples: [
          'Budget of $10,000 for security systems and training, 2 staff members for implementation',
          'IT consultant for data backup systems, $5,000 for equipment upgrades',
          'Training budget of $3,000, 1 day per week from each department head',
        ],
      },
      {
        type: 'text' as const,
        label: 'Responsible Parties',
        required: true,
        prompt: 'Who will be responsible for implementing and maintaining different aspects of the plan?',
        examples: [
          'IT Manager for technical systems, HR Manager for training, Operations Manager for procedures',
          'Owner for overall coordination, Office Manager for documentation, Department Heads for their areas',
          'Business Continuity Team (3 staff members) for implementation, Department Managers for maintenance',
        ],
      },
      {
        type: 'text' as const,
        label: 'Review and Update Schedule',
        required: true,
        prompt: 'How often will you review and update your business continuity plan?',
        examples: [
          'Quarterly reviews, annual comprehensive updates',
          'Bi-annual reviews, update after any major business changes',
          'Monthly check-ins, quarterly detailed reviews, annual full update',
        ],
      },
    ],
  },
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [currentStep, setCurrentStep] = useState('BUSINESS_OVERVIEW')
  const [currentInputIndex, setCurrentInputIndex] = useState(0)
  const [stepData, setStepData] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize conversation
  useEffect(() => {
    const currentInput = STEPS.BUSINESS_OVERVIEW.inputs[0]
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Welcome to the CARICHAM Business Continuity Plan creator! I'll guide you through creating a comprehensive business continuity plan for your business.

${currentInput.prompt}

Here are some examples:
${currentInput.examples?.map(ex => `• ${ex}`).join('\n')}`,
      structuredInput: {
        type: currentInput.type,
        label: currentInput.label,
        required: currentInput.required,
        options: currentInput.options,
        prompt: currentInput.prompt,
      },
    }
    setMessages([welcomeMessage])
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    const newMessage: Message = {
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, newMessage])
    setInput('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          currentStep,
          sessionId: 'test-session',
          stepData,
          currentInput: STEPS[currentStep as keyof typeof STEPS].inputs[currentInputIndex],
        }),
      })

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
        },
      ])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your message. Please try again.',
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStructuredInputComplete = async (value: any) => {
    const currentStepData = STEPS[currentStep as keyof typeof STEPS]
    const currentInput = currentStepData.inputs[currentInputIndex]

    // Store the response
    setStepData((prev) => ({
      ...prev,
      [currentStep]: {
        ...prev[currentStep],
        [currentInput.label]: value,
      },
    }))

    // Add user's response to chat
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: typeof value === 'string' ? value : JSON.stringify(value),
      },
    ])

    // Process the response with the LLM
    setIsProcessing(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `User provided the following information for "${currentInput.label}": ${value}. Please analyze this response and provide any necessary clarification or additional questions.`,
          currentStep,
          sessionId: 'test-session',
          stepData,
          currentInput,
        }),
      })

      const data = await response.json()

      // Add LLM's analysis
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
        },
      ])

      // Move to next input or step
      if (currentInputIndex < currentStepData.inputs.length - 1) {
        // Move to next input in current step
        const nextInputIndex = currentInputIndex + 1
        setCurrentInputIndex(nextInputIndex)
        const nextInput = currentStepData.inputs[nextInputIndex]
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `${nextInput.prompt}\n\nHere are some examples:\n${nextInput.examples?.map(ex => `• ${ex}`).join('\n')}`,
            structuredInput: {
              type: nextInput.type,
              label: nextInput.label,
              required: 'required' in nextInput ? nextInput.required : false,
              options: 'options' in nextInput ? nextInput.options : undefined,
              prompt: nextInput.prompt,
            },
          },
        ])
      } else {
        // Move to next step
        const steps = Object.keys(STEPS)
        const currentStepIndex = steps.indexOf(currentStep)
        if (currentStepIndex < steps.length - 1) {
          const nextStep = steps[currentStepIndex + 1]
          setCurrentStep(nextStep)
          setCurrentInputIndex(0)
          const nextStepData = STEPS[nextStep as keyof typeof STEPS]
          const nextInput = nextStepData.inputs[0]
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `${nextStepData.description}\n\n${nextInput.prompt}\n\nHere are some examples:\n${nextInput.examples?.map(ex => `• ${ex}`).join('\n')}`,
              structuredInput: {
                type: nextInput.type,
                label: nextInput.label,
                required: 'required' in nextInput ? nextInput.required : false,
                options: 'options' in nextInput ? nextInput.options : undefined,
                prompt: nextInput.prompt,
              },
            },
          ])
        } else {
          // This is the final step and input - show completion message
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `Congratulations! You have completed your Business Continuity Plan. Here's a summary of what we've covered:

1. Business Overview: Understanding your business structure and operations
2. Essential Functions: Identifying critical business processes
3. Risk Assessment: Evaluating potential threats and vulnerabilities
4. Strategies: Developing prevention, response, and recovery strategies
5. Action Plan: Creating an implementation timeline and assigning responsibilities

Your plan has been saved and can be accessed later. Would you like to:
• Review your complete plan
• Download a PDF copy
• Make any adjustments to specific sections
• Start a new plan for another aspect of your business

Please let me know how you'd like to proceed.`,
            },
          ])
        }
      }
    } catch (error) {
      console.error('Error processing response:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your response. Please try again.',
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate progress
  const totalSteps = Object.keys(STEPS).length
  const currentStepIndex = Object.keys(STEPS).indexOf(currentStep)
  const progress = ((currentStepIndex + currentInputIndex / STEPS[currentStep as keyof typeof STEPS].inputs.length) / totalSteps) * 100

  return (
    <div className="flex h-full flex-col">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-2">
        <div
          className="bg-primary-600 h-2 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="bg-white px-4 py-2 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          {STEPS[currentStep as keyof typeof STEPS].title}
        </h2>
        <p className="text-sm text-gray-500">
          Step {currentStepIndex + 1} of {totalSteps}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.structuredInput && (
                  <div className="mt-4">
                    <StructuredInput
                      {...message.structuredInput}
                      onComplete={handleStructuredInputComplete}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Only show input if there's no active structured input and not processing */}
      {!messages[messages.length - 1]?.structuredInput && !isProcessing && (
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              disabled={isProcessing}
            />
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Send'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
} 