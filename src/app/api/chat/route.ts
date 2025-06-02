import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const STEPS = {
  BUSINESS_OVERVIEW: {
    title: 'Business Overview',
    description: 'Let\'s start by understanding your business better.',
  },
  ESSENTIAL_FUNCTIONS: {
    title: 'Essential Business Functions',
    description: 'Now, let\'s identify the key functions that keep your business running.',
  },
  RISK_ASSESSMENT: {
    title: 'Risk Assessment',
    description: 'Let\'s identify potential risks to your business.',
  },
  STRATEGIES: {
    title: 'Business Continuity Strategies',
    description: 'Now, let\'s develop strategies to protect your business.',
  },
  ACTION_PLAN: {
    title: 'Action Plan',
    description: 'Finally, let\'s create a detailed action plan.',
  },
}

export async function POST(req: Request) {
  try {
    const { message, currentStep, sessionId, stepData, currentInput } = await req.json()

    // Prepare conversation history for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are a business continuity planning assistant following the CARICHAM methodology. You are currently on step ${currentStep} of 5.

        Step 1: Analyze Your Business
        Step 2: Assess the Risks
        Step 3: Develop Strategies
        Step 4: Make a Plan
        Step 5: Test & Assess Your Plan

        Use a warm, conversational tone and provide clear explanations of business continuity concepts.
        Include Caribbean-specific examples and terminology when relevant.
        
        Current session data: ${JSON.stringify({})}
        Current step data: ${JSON.stringify(stepData)}
        Current input: ${JSON.stringify(currentInput)}

        When analyzing user responses:
        1. Acknowledge their input
        2. Provide positive reinforcement
        3. If the response is unclear or incomplete, ask for clarification
        4. If the response is good, confirm and move on
        5. Always maintain a supportive and encouraging tone
        6. Use Caribbean-specific examples when relevant
        7. Keep responses concise but helpful`
      },
      {
        role: 'user',
        content: message
      }
    ]

    // Get response from OpenAI
    // const completion = await openai.chat.completions.create({
    //   model: 'gpt-4-turbo-preview',
    //   messages,
    //   temperature: 0.7,
    //   max_tokens: 500,
    // })

    // const response = completion.choices[0].message.content

    // Update session in database
    // await prisma.session.update({
    //   where: { id: sessionId },
    //   data: {
    //     stepData: JSON.stringify({
    //       ...JSON.parse(stepData || '{}'),
    //       [currentStep]: {
    //         ...JSON.parse(stepData || '{}')[currentStep],
    //         ...stepData,
    //         lastMessage: message,
    //       },
    //     }),
    //   },
    // })

    return NextResponse.json({
      message: 'No response generated',
      nextStep: currentStep,
      sessionId,
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 