import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add Cost Items for Cyber Security Strategy
 */

async function addCyberSecurityCostItems() {
  console.log('💻 Adding Cyber Security Cost Items...\n')

  // Antivirus Software Subscription
  await prisma.costItem.upsert({
    where: { itemId: 'antivirus_subscription' },
    update: {
      name: JSON.stringify({ en: 'Antivirus Software Subscription', es: 'Suscripción de Software Antivirus', fr: 'Abonnement Logiciel Antivirus' }),
      description: JSON.stringify({
        en: 'Annual subscription for comprehensive antivirus and malware protection',
        es: 'Suscripción anual para protección antivirus y malware integral',
        fr: 'Abonnement annuel pour protection antivirus et malware complète'
      }),
      category: 'service',
      baseUSD: 60.00,
      baseUSDMin: 30.00,
      baseUSDMax: 120.00,
      unit: 'per year',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Free alternatives like Windows Defender available',
        es: 'Alternativas gratuitas como Windows Defender disponibles',
        fr: 'Alternatives gratuites comme Windows Defender disponibles'
      }),
      tags: JSON.stringify(['cyber', 'security', 'antivirus', 'malware']),
      isActive: true
    },
    create: {
      itemId: 'antivirus_subscription',
      name: JSON.stringify({ en: 'Antivirus Software Subscription', es: 'Suscripción de Software Antivirus', fr: 'Abonnement Logiciel Antivirus' }),
      description: JSON.stringify({
        en: 'Annual subscription for comprehensive antivirus and malware protection',
        es: 'Suscripción anual para protección antivirus y malware integral',
        fr: 'Abonnement annuel pour protection antivirus et malware complète'
      }),
      category: 'service',
      baseUSD: 60.00,
      baseUSDMin: 30.00,
      baseUSDMax: 120.00,
      unit: 'per year',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Free alternatives like Windows Defender available',
        es: 'Alternativas gratuitas como Windows Defender disponibles',
        fr: 'Alternatives gratuites comme Windows Defender disponibles'
      }),
      tags: JSON.stringify(['cyber', 'security', 'antivirus', 'malware']),
      isActive: true
    }
  })
  console.log('  ✓ Antivirus Software Subscription added')

  // Password Manager
  await prisma.costItem.upsert({
    where: { itemId: 'password_manager' },
    update: {
      name: JSON.stringify({ en: 'Password Manager', es: 'Administrador de Contraseñas', fr: 'Gestionnaire de Mots de Passe' }),
      description: JSON.stringify({
        en: 'Secure password storage and generation tool',
        es: 'Herramienta segura para almacenamiento y generación de contraseñas',
        fr: 'Outil sécurisé de stockage et génération de mots de passe'
      }),
      category: 'service',
      baseUSD: 36.00,
      baseUSDMin: 0.00,
      baseUSDMax: 60.00,
      unit: 'per year',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Free basic versions available from LastPass, Bitwarden',
        es: 'Versiones básicas gratuitas disponibles de LastPass, Bitwarden',
        fr: 'Versions de base gratuites disponibles de LastPass, Bitwarden'
      }),
      tags: JSON.stringify(['cyber', 'security', 'passwords', 'authentication']),
      isActive: true
    },
    create: {
      itemId: 'password_manager',
      name: JSON.stringify({ en: 'Password Manager', es: 'Administrador de Contraseñas', fr: 'Gestionnaire de Mots de Passe' }),
      description: JSON.stringify({
        en: 'Secure password storage and generation tool',
        es: 'Herramienta segura para almacenamiento y generación de contraseñas',
        fr: 'Outil sécurisé de stockage et génération de mots de passe'
      }),
      category: 'service',
      baseUSD: 36.00,
      baseUSDMin: 0.00,
      baseUSDMax: 60.00,
      unit: 'per year',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Free basic versions available from LastPass, Bitwarden',
        es: 'Versiones básicas gratuitas disponibles de LastPass, Bitwarden',
        fr: 'Versions de base gratuites disponibles de LastPass, Bitwarden'
      }),
      tags: JSON.stringify(['cyber', 'security', 'passwords', 'authentication']),
      isActive: true
    }
  })
  console.log('  ✓ Password Manager added')

  // Cloud Backup Service
  await prisma.costItem.upsert({
    where: { itemId: 'cloud_backup_service' },
    update: {
      name: JSON.stringify({ en: 'Cloud Backup Service', es: 'Servicio de Copia de Seguridad en la Nube', fr: 'Service de Sauvegarde Cloud' }),
      description: JSON.stringify({
        en: 'Automated cloud backup for business data protection',
        es: 'Copia de seguridad automatizada en la nube para protección de datos comerciales',
        fr: 'Sauvegarde cloud automatisée pour protection des données commerciales'
      }),
      category: 'service',
      baseUSD: 120.00,
      baseUSDMin: 60.00,
      baseUSDMax: 300.00,
      unit: 'per year',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Google Drive, Dropbox, OneDrive offer business plans',
        es: 'Google Drive, Dropbox, OneDrive ofrecen planes comerciales',
        fr: 'Google Drive, Dropbox, OneDrive offrent des plans d\'affaires'
      }),
      tags: JSON.stringify(['cyber', 'backup', 'cloud', 'data']),
      isActive: true
    },
    create: {
      itemId: 'cloud_backup_service',
      name: JSON.stringify({ en: 'Cloud Backup Service', es: 'Servicio de Copia de Seguridad en la Nube', fr: 'Service de Sauvegarde Cloud' }),
      description: JSON.stringify({
        en: 'Automated cloud backup for business data protection',
        es: 'Copia de seguridad automatizada en la nube para protección de datos comerciales',
        fr: 'Sauvegarde cloud automatisée pour protection des données commerciales'
      }),
      category: 'service',
      baseUSD: 120.00,
      baseUSDMin: 60.00,
      baseUSDMax: 300.00,
      unit: 'per year',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Google Drive, Dropbox, OneDrive offer business plans',
        es: 'Google Drive, Dropbox, OneDrive ofrecen planes comerciales',
        fr: 'Google Drive, Dropbox, OneDrive offrent des plans d\'affaires'
      }),
      tags: JSON.stringify(['cyber', 'backup', 'cloud', 'data']),
      isActive: true
    }
  })
  console.log('  ✓ Cloud Backup Service added')

  // Cyber Insurance
  await prisma.costItem.upsert({
    where: { itemId: 'cyber_insurance' },
    update: {
      name: JSON.stringify({ en: 'Cyber Liability Insurance', es: 'Seguro de Responsabilidad Cibernética', fr: 'Assurance Responsabilité Cybernétique' }),
      description: JSON.stringify({
        en: 'Insurance coverage for cyber attacks, data breaches, and related liabilities',
        es: 'Cobertura de seguro para ataques cibernéticos, brechas de datos y responsabilidades relacionadas',
        fr: 'Couverture d\'assurance pour cyberattaques, violations de données et responsabilités connexes'
      }),
      category: 'service',
      baseUSD: 800.00,
      baseUSDMin: 500.00,
      baseUSDMax: 2000.00,
      unit: 'per year',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Often bundled with general business insurance',
        es: 'A menudo incluido con seguro comercial general',
        fr: 'Souvent inclus avec l\'assurance commerciale générale'
      }),
      tags: JSON.stringify(['cyber', 'insurance', 'liability', 'breach']),
      isActive: true
    },
    create: {
      itemId: 'cyber_insurance',
      name: JSON.stringify({ en: 'Cyber Liability Insurance', es: 'Seguro de Responsabilidad Cibernética', fr: 'Assurance Responsabilité Cybernétique' }),
      description: JSON.stringify({
        en: 'Insurance coverage for cyber attacks, data breaches, and related liabilities',
        es: 'Cobertura de seguro para ataques cibernéticos, brechas de datos y responsabilidades relacionadas',
        fr: 'Couverture d\'assurance pour cyberattaques, violations de données et responsabilités connexes'
      }),
      category: 'service',
      baseUSD: 800.00,
      baseUSDMin: 500.00,
      baseUSDMax: 2000.00,
      unit: 'per year',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Often bundled with general business insurance',
        es: 'A menudo incluido con seguro comercial general',
        fr: 'Souvent inclus avec l\'assurance commerciale générale'
      }),
      tags: JSON.stringify(['cyber', 'insurance', 'liability', 'breach']),
      isActive: true
    }
  })
  console.log('  ✓ Cyber Insurance added')

  console.log('\n✅ Cyber Security Cost Items Added Successfully!')
}

async function main() {
  try {
    await addCyberSecurityCostItems()
  } catch (error) {
    console.error('❌ Error adding cost items:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { addCyberSecurityCostItems }

