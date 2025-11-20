import fetch from 'node-fetch'

async function main() {
    const response = await fetch('http://localhost:3000/api/wizard/get-risk-calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            hazardIds: ['power_outage', 'power_outage', 'hurricane'],
            businessTypeId: 'retail',
            countryCode: 'JM',
            parish: 'Kingston'
        })
    })

    const data = await response.json()

    if (data.riskCalculations) {
        const powerRisks = data.riskCalculations.filter((r: any) => r.hazardId === 'power_outage')
        console.log(`Found ${powerRisks.length} power_outage risks.`)

        if (powerRisks.length === 1) {
            console.log('✅ Deduplication SUCCESS: Only 1 power_outage risk found.')
        } else {
            console.log('❌ Deduplication FAILED: Found duplicates.')
        }

        const allRisks = data.riskCalculations.map((r: any) => r.hazardId)
        console.log('All returned risks:', allRisks)
    } else {
        console.log('Error:', data)
    }
}

main().catch(console.error)
