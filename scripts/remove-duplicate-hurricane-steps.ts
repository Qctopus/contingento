import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Parse multilingual JSON to get English text
 */
function getEnglishText(field: string | null | undefined): string {
  if (!field) return ''
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed.en || parsed.En || ''
      }
      return field
    } catch {
      return field
    }
  }
  return String(field)
}

/**
 * Normalize title for comparison (lowercase, remove extra spaces)
 */
function normalizeTitle(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, ' ')
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   REMOVE DUPLICATE HURRICANE ACTION STEPS                   ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  try {
    // Get the hurricane_comprehensive strategy
    const strategy = await prisma.riskMitigationStrategy.findFirst({
      where: { 
        strategyId: 'hurricane_comprehensive',
        isActive: true 
      },
      include: {
        actionSteps: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })
    
    if (!strategy) {
      console.log('❌ Strategy "hurricane_comprehensive" not found')
      await prisma.$disconnect()
      return
    }
    
    console.log(`📋 Found strategy: ${strategy.strategyId}`)
    console.log(`📊 Total action steps: ${strategy.actionSteps.length}\n`)
    
    // Group steps by normalized title to find duplicates
    const titleMap = new Map<string, any[]>()
    
    for (const step of strategy.actionSteps) {
      const title = getEnglishText(step.title)
      const normalized = normalizeTitle(title)
      
      if (!titleMap.has(normalized)) {
        titleMap.set(normalized, [])
      }
      titleMap.get(normalized)!.push(step)
    }
    
    // Find duplicates - both exact and similar titles
    const duplicates: Array<{ title: string; steps: any[] }> = []
    
    // First, find exact duplicates
    for (const [normalizedTitle, steps] of titleMap.entries()) {
      if (steps.length > 1) {
        duplicates.push({
          title: steps[0].title ? getEnglishText(steps[0].title) : normalizedTitle,
          steps
        })
      }
    }
    
    // Then find similar titles (same key words but different wording)
    const allSteps = strategy.actionSteps
    const processed = new Set<string>()
    
    for (let i = 0; i < allSteps.length; i++) {
      if (processed.has(allSteps[i].id)) continue
      
      const title1 = normalizeTitle(getEnglishText(allSteps[i].title))
      const words1 = title1.split(/\s+/).filter(w => w.length > 3)
      
      const similarSteps: any[] = [allSteps[i]]
      
      for (let j = i + 1; j < allSteps.length; j++) {
        if (processed.has(allSteps[j].id)) continue
        
        const title2 = normalizeTitle(getEnglishText(allSteps[j].title))
        const words2 = title2.split(/\s+/).filter(w => w.length > 3)
        
        // Check if they're similar (same phase, similar key words)
        if (allSteps[i].phase === allSteps[j].phase) {
          const commonWords = words1.filter(w => words2.includes(w))
          
          // Check for known duplicate patterns
          const isDocumentDuplicate = 
            (title1.includes('document') && title2.includes('document') && 
             title1.includes('property') && title2.includes('property') &&
             title1.includes('inventory') && title2.includes('inventory'))
          
          const isInstallDuplicate = 
            (title1.includes('install') && title2.includes('install') &&
             title1.includes('hurricane') && title2.includes('hurricane') &&
             (title1.includes('protection') || title1.includes('shutter') || title1.includes('board')) &&
             (title2.includes('protection') || title2.includes('shutter') || title2.includes('board')))
          
          const isElevateDuplicate = 
            (title1.includes('elevate') && title2.includes('elevate') &&
             (title1.includes('equipment') || title1.includes('inventory')) &&
             (title2.includes('equipment') || title2.includes('inventory')))
          
          if (isDocumentDuplicate || isInstallDuplicate || isElevateDuplicate) {
            similarSteps.push(allSteps[j])
            processed.add(allSteps[j].id)
          }
        }
      }
      
      if (similarSteps.length > 1) {
        processed.add(allSteps[i].id)
        duplicates.push({
          title: getEnglishText(allSteps[i].title),
          steps: similarSteps
        })
      }
    }
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!')
      await prisma.$disconnect()
      return
    }
    
    console.log(`⚠️  Found ${duplicates.length} duplicate title(s):\n`)
    
    let removedCount = 0
    
    for (const dup of duplicates) {
      console.log(`📌 "${dup.title}" - ${dup.steps.length} occurrences:`)
      
      // Sort to keep the BEST version
      // Priority: 1) Steps with proper stepId format (hurricane_step_XX), 2) Newer steps, 3) Phase priority
      const sortedSteps = dup.steps.sort((a, b) => {
        // Prefer steps with proper stepId format (hurricane_step_XX) - these are from comprehensive-strategy-seed.ts
        const aHasProperId = a.stepId && a.stepId.startsWith('hurricane_step_')
        const bHasProperId = b.stepId && b.stepId.startsWith('hurricane_step_')
        
        if (aHasProperId && !bHasProperId) return -1 // Keep a
        if (!aHasProperId && bHasProperId) return 1  // Keep b
        
        // If both have proper IDs or neither does, prefer newer (more recent)
        const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (dateDiff !== 0) return dateDiff
        
        // Finally, phase priority
        const phasePriority: Record<string, number> = {
          'before': 1,
          'during': 2,
          'after': 3
        }
        return (phasePriority[a.phase] || 999) - (phasePriority[b.phase] || 999)
      })
      
      // Keep the first one (best quality)
      const keepStep = sortedSteps[0]
      const removeSteps = sortedSteps.slice(1)
      
      console.log(`   ✓ Keeping: ${keepStep.stepId || keepStep.id} (phase: ${keepStep.phase}, created: ${keepStep.createdAt.toISOString().split('T')[0]})`)
      
      // Remove the duplicates
      for (const removeStep of removeSteps) {
        console.log(`   ✗ Removing: ${removeStep.stepId || removeStep.id} (phase: ${removeStep.phase}, created: ${removeStep.createdAt.toISOString().split('T')[0]})`)
        
        await prisma.actionStep.update({
          where: { id: removeStep.id },
          data: { isActive: false }
        })
        
        removedCount++
      }
      console.log('')
    }
    
    console.log('═'.repeat(65))
    console.log('')
    console.log(`✅ Cleanup complete!`)
    console.log(`   Duplicates removed: ${removedCount}`)
    console.log('')
    
    // Show final step list
    const finalSteps = await prisma.actionStep.findMany({
      where: {
        strategyId: strategy.id,
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    })
    
    console.log(`📋 Final step count: ${finalSteps.length}`)
    console.log('\nFinal steps:')
    finalSteps.forEach((step, idx) => {
      const title = getEnglishText(step.title)
      console.log(`   ${idx + 1}. [${step.phase}] ${title}`)
    })
    console.log('')
    
  } catch (error) {
    console.error('\n❌ Error:')
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { main as removeDuplicateHurricaneSteps }

