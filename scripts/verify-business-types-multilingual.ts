import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyMultilingualData() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   VERIFY BUSINESS TYPES - MULTILINGUAL DATA                  ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')

  const businessTypes = await prisma.businessType.findMany({
    where: { isActive: true },
    orderBy: { businessTypeId: 'asc' }
  })

  console.log(`Found ${businessTypes.length} business types\n`)

  let hasIssues = 0
  let allGood = 0

  for (const bt of businessTypes) {
    let issues: string[] = []

    // Check name
    try {
      const nameObj = typeof bt.name === 'string' ? JSON.parse(bt.name) : bt.name
      if (!nameObj.en || !nameObj.es || !nameObj.fr) {
        issues.push(`Name missing translations: en=${!!nameObj.en}, es=${!!nameObj.es}, fr=${!!nameObj.fr}`)
      }
    } catch (e) {
      issues.push(`Name is not valid JSON`)
    }

    // Check description
    if (bt.description) {
      try {
        const descObj = typeof bt.description === 'string' ? JSON.parse(bt.description) : bt.description
        if (!descObj.en || !descObj.es || !descObj.fr) {
          issues.push(`Description missing translations: en=${!!descObj.en}, es=${!!descObj.es}, fr=${!!descObj.fr}`)
        }
      } catch (e) {
        issues.push(`Description is not valid JSON`)
      }
    } else {
      issues.push(`Description is null/empty`)
    }

    if (issues.length > 0) {
      console.log(`  ⚠️  ${bt.businessTypeId}:`)
      issues.forEach(issue => console.log(`     - ${issue}`))
      hasIssues++
    } else {
      allGood++
    }
  }

  console.log('\n' + '═'.repeat(65))
  console.log('✅ VERIFICATION SUMMARY')
  console.log('═'.repeat(65))
  console.log(`  ✓ All good: ${allGood}`)
  console.log(`  ⚠️  Has issues: ${hasIssues}`)
  console.log(`  Total: ${businessTypes.length}`)
  console.log('')
}

async function main() {
  try {
    await verifyMultilingualData()
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

export { verifyMultilingualData }

