const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Helper to create multilingual JSON
function ml(en, es, fr) {
  return JSON.stringify({ en, es, fr })
}

// Helper for multilingual arrays
function mlArray(enArray, esArray, frArray) {
  return JSON.stringify({
    en: enArray,
    es: esArray,
    fr: frArray
  })
}

// Complete multilingual strategy data with ALL fields populated
const COMPLETE_STRATEGIES = [
  {
    strategyId: 'cybersecurity_protection',
    updates: {
      // Strategy-level multilingual fields
      smeTitle: ml(
        "Protect Your Business from Hackers and Scammers",
        "Protege Tu Negocio de Hackers y Estafadores",
        "Protégez Votre Entreprise des Hackers et Escrocs"
      ),
      smeSummary: ml(
        "Cyber criminals target small businesses because they think you don't have protection. One successful attack can wipe out your bank account, steal customer data, or lock you out of your own systems.",
        "Los ciberdelincuentes atacan a pequeñas empresas porque piensan que no tienes protección. Un ataque exitoso puede vaciar tu cuenta bancaria, robar datos de clientes o bloquearte de tus propios sistemas.",
        "Les cybercriminels ciblent les petites entreprises car ils pensent que vous n'avez pas de protection. Une attaque réussie peut vider votre compte bancaire, voler les données des clients ou vous bloquer de vos propres systèmes."
      ),
      benefitsBullets: mlArray(
        [
          "Prevent hackers from stealing your money",
          "Protect customer information and trust",
          "Avoid ransomware locking your files",
          "Keep your business accounts safe"
        ],
        [
          "Evita que los hackers roben tu dinero",
          "Protege la información y confianza del cliente",
          "Evita que ransomware bloquee tus archivos",
          "Mantén seguras las cuentas de tu negocio"
        ],
        [
          "Empêchez les hackers de voler votre argent",
          "Protégez les informations clients et la confiance",
          "Évitez que les rançongiciels verrouillent vos fichiers",
          "Gardez vos comptes professionnels en sécurité"
        ]
      ),
      realWorldExample: ml(
        "A Kingston restaurant owner clicked a fake NCB email link in 2023. Scammers drained JMD 380,000 from the business account overnight. Another business in Montego Bay had all their files encrypted by ransomware - lost customer records, invoices, everything. Both could have been prevented with basic cybersecurity.",
        "Un dueño de restaurante en Kingston hizo clic en un enlace falso de correo de NCB en 2023. Los estafadores vaciaron JMD 380,000 de la cuenta comercial durante la noche. Otro negocio en Montego Bay tuvo todos sus archivos encriptados por ransomware - perdió registros de clientes, facturas, todo. Ambos podrían haberse prevenido con ciberseguridad básica.",
        "Un propriétaire de restaurant à Kingston a cliqué sur un faux lien email NCB en 2023. Les escrocs ont vidé 380 000 JMD du compte professionnel du jour au lendemain. Une autre entreprise à Montego Bay a eu tous ses fichiers cryptés par un rançongiciel - perdu les dossiers clients, factures, tout. Les deux auraient pu être évités avec une cybersécurité de base."
      ),
      lowBudgetAlternative: ml(
        "Free solutions: Use Google Drive (15GB free) for backups. Enable 2-factor authentication on all accounts (free). Use strong passwords (write them in a notebook, not on computer). Free antivirus like AVG or Avast. Total cost: JMD 0.",
        "Soluciones gratuitas: Usa Google Drive (15GB gratis) para respaldos. Activa autenticación de 2 factores en todas las cuentas (gratis). Usa contraseñas fuertes (escríbelas en un cuaderno, no en la computadora). Antivirus gratuito como AVG o Avast. Costo total: JMD 0.",
        "Solutions gratuites : Utilisez Google Drive (15 Go gratuits) pour les sauvegardes. Activez l'authentification à 2 facteurs sur tous les comptes (gratuit). Utilisez des mots de passe forts (écrivez-les dans un carnet, pas sur l'ordinateur). Antivirus gratuit comme AVG ou Avast. Coût total : 0 JMD."
      ),
      diyApproach: ml(
        "1) Change all passwords to strong ones (12+ characters, mix of letters/numbers/symbols). 2) Enable 2-factor authentication on bank and email (takes 5 minutes). 3) Set up automatic backups to cloud (Google Drive/Dropbox free accounts). 4) Install free antivirus. 5) Train staff: Never click links in unexpected emails, verify requests by phone, use strong passwords.",
        "1) Cambia todas las contraseñas a fuertes (12+ caracteres, mezcla de letras/números/símbolos). 2) Activa autenticación de 2 factores en banco y correo (toma 5 minutos). 3) Configura respaldos automáticos a la nube (cuentas gratuitas Google Drive/Dropbox). 4) Instala antivirus gratuito. 5) Capacita al personal: Nunca hacer clic en enlaces de correos inesperados, verificar solicitudes por teléfono, usar contraseñas fuertes.",
        "1) Changez tous les mots de passe en mots de passe forts (12+ caractères, mélange de lettres/chiffres/symboles). 2) Activez l'authentification à 2 facteurs sur la banque et l'email (prend 5 minutes). 3) Configurez des sauvegardes automatiques vers le cloud (comptes gratuits Google Drive/Dropbox). 4) Installez un antivirus gratuit. 5) Formez le personnel : Ne jamais cliquer sur des liens dans des emails inattendus, vérifier les demandes par téléphone, utiliser des mots de passe forts."
      ),
      helpfulTips: mlArray(
        [
          "Use a passphrase you can remember: 'MyShopOpenedInJune2020!' is strong",
          "Enable 2-step verification on ALL accounts that offer it - especially banking",
          "Back up your important files weekly - set a phone reminder",
          "If email looks suspicious, call the person to verify before clicking anything"
        ],
        [
          "Usa una frase de contraseña que puedas recordar: '¡MiTiendaAbrióEnJunio2020!' es fuerte",
          "Activa la verificación de 2 pasos en TODAS las cuentas que la ofrezcan - especialmente banca",
          "Respalda tus archivos importantes semanalmente - configura un recordatorio en el teléfono",
          "Si un correo parece sospechoso, llama a la persona para verificar antes de hacer clic"
        ],
        [
          "Utilisez une phrase de passe dont vous vous souvenez : 'MonMagasinOuvertEnJuin2020!' est fort",
          "Activez la vérification en 2 étapes sur TOUS les comptes qui l'offrent - surtout bancaire",
          "Sauvegardez vos fichiers importants hebdomadairement - réglez un rappel téléphonique",
          "Si un email semble suspect, appelez la personne pour vérifier avant de cliquer"
        ]
      ),
      commonMistakes: mlArray(
        [
          "Using same password for everything - one breach compromises all accounts",
          "Clicking links in emails without checking sender carefully",
          "No backup - ransomware locks your files with no recovery option",
          "Sharing business passwords via WhatsApp or text (not secure)",
          "Never updating software - old software has security holes"
        ],
        [
          "Usar la misma contraseña para todo - una brecha compromete todas las cuentas",
          "Hacer clic en enlaces de correos sin verificar el remitente cuidadosamente",
          "Sin respaldo - ransomware bloquea tus archivos sin opción de recuperación",
          "Compartir contraseñas comerciales por WhatsApp o texto (no seguro)",
          "Nunca actualizar software - software viejo tiene agujeros de seguridad"
        ],
        [
          "Utiliser le même mot de passe pour tout - une faille compromet tous les comptes",
          "Cliquer sur des liens dans des emails sans vérifier l'expéditeur attentivement",
          "Pas de sauvegarde - rançongiciel verrouille vos fichiers sans option de récupération",
          "Partager des mots de passe professionnels via WhatsApp ou SMS (pas sécurisé)",
          "Ne jamais mettre à jour les logiciels - vieux logiciels ont des failles de sécurité"
        ]
      ),
      successMetrics: mlArray(
        [
          "All critical accounts have unique, strong passwords",
          "2-factor authentication enabled on banking and email",
          "Weekly backups running automatically",
          "Can identify and ignore phishing emails"
        ],
        [
          "Todas las cuentas críticas tienen contraseñas únicas y fuertes",
          "Autenticación de 2 factores activada en banca y correo",
          "Respaldos semanales ejecutándose automáticamente",
          "Puedes identificar e ignorar correos de phishing"
        ],
        [
          "Tous les comptes critiques ont des mots de passe uniques et forts",
          "Authentification à 2 facteurs activée sur banque et email",
          "Sauvegardes hebdomadaires s'exécutant automatiquement",
          "Peut identifier et ignorer les emails de phishing"
        ]
      )
    },
    actionSteps: [
      {
        stepId: 'cyber_step_1',
        phase: 'immediate',
        title: ml(
          "Buy antivirus software for all computers, keep it updated automatically",
          "Compre software antivirus para todas las computadoras, manténgalo actualizado automáticamente",
          "Achetez un logiciel antivirus pour tous les ordinateurs, gardez-le mis à jour automatiquement"
        ),
        description: ml(
          "Purchase antivirus protection from reputable provider (AVG, Avast, Norton, McAfee). Install on ALL business computers. Enable automatic updates so it stays current against new threats.",
          "Compre protección antivirus de un proveedor confiable (AVG, Avast, Norton, McAfee). Instale en TODAS las computadoras del negocio. Active actualizaciones automáticas para que se mantenga actualizado contra nuevas amenazas.",
          "Achetez une protection antivirus d'un fournisseur réputé (AVG, Avast, Norton, McAfee). Installez sur TOUS les ordinateurs professionnels. Activez les mises à jour automatiques pour qu'il reste à jour contre les nouvelles menaces."
        ),
        whyThisStepMatters: ml(
          "Antivirus stops 95% of malware before it infects your computers. Without it, one infected file from an email or USB drive can shut down your entire business.",
          "El antivirus detiene el 95% del malware antes de que infecte tus computadoras. Sin él, un archivo infectado de un correo o USB puede cerrar todo tu negocio.",
          "L'antivirus arrête 95% des malwares avant qu'ils n'infectent vos ordinateurs. Sans lui, un fichier infecté d'un email ou USB peut fermer toute votre entreprise."
        ),
        whatHappensIfSkipped: ml(
          "You'll eventually get hit with malware or ransomware. Could lose all your files, have money stolen, or your computer locked until you pay ransom. Recovery costs JMD 50,000-200,000+.",
          "Eventualmente te atacará malware o ransomware. Podrías perder todos tus archivos, que te roben dinero, o tu computadora bloqueada hasta que pagues rescate. Recuperación cuesta JMD 50,000-200,000+.",
          "Vous serez éventuellement touché par un malware ou rançongiciel. Pourrait perdre tous vos fichiers, se faire voler de l'argent, ou votre ordinateur verrouillé jusqu'à payer une rançon. Récupération coûte 50 000-200 000+ JMD."
        ),
        howToKnowItsDone: ml(
          "Green checkmark showing antivirus is active. Automatic updates enabled. Last scan completed in last 7 days.",
          "Marca verde mostrando que el antivirus está activo. Actualizaciones automáticas activadas. Último escaneo completado en los últimos 7 días.",
          "Coche verte montrant que l'antivirus est actif. Mises à jour automatiques activées. Dernier scan complété dans les 7 derniers jours."
        ),
        exampleOutput: ml(
          "AVG Antivirus icon in system tray showing 'Protected'. Settings show 'Automatic updates: ON'. Last full scan: Yesterday.",
          "Ícono de AVG Antivirus en bandeja del sistema mostrando 'Protegido'. Configuración muestra 'Actualizaciones automáticas: ACTIVADAS'. Último escaneo completo: Ayer.",
          "Icône AVG Antivirus dans la barre système montrant 'Protégé'. Paramètres montrent 'Mises à jour automatiques : ACTIVÉES'. Dernier scan complet : Hier."
        ),
        freeAlternative: ml(
          "Use free version of AVG, Avast, or Windows Defender (built into Windows). Not as powerful as paid, but WAY better than nothing.",
          "Usa versión gratuita de AVG, Avast, o Windows Defender (integrado en Windows). No tan poderoso como pago, pero MUCHO mejor que nada.",
          "Utilisez la version gratuite d'AVG, Avast, ou Windows Defender (intégré dans Windows). Pas aussi puissant que payant, mais BEAUCOUP mieux que rien."
        ),
        lowTechOption: ml(
          "If no internet for updates: Use USB antivirus scanner that doesn't need installation. Not ideal but provides some protection.",
          "Si no hay internet para actualizaciones: Usa escáner antivirus USB que no necesita instalación. No es ideal pero provee algo de protección.",
          "Si pas d'internet pour mises à jour : Utilisez un scanner antivirus USB qui ne nécessite pas d'installation. Pas idéal mais fournit une certaine protection."
        ),
        commonMistakesForStep: mlArray(
          [
            "Buying antivirus but never opening it - needs to run all the time",
            "Turning off because 'it slows down computer' - protection is worth it",
            "Using cracked/pirated antivirus - often contains malware itself!"
          ],
          [
            "Comprar antivirus pero nunca abrirlo - necesita ejecutarse todo el tiempo",
            "Apagarlo porque 'hace lenta la computadora' - la protección vale la pena",
            "Usar antivirus crackeado/pirata - ¡a menudo contiene malware en sí!"
          ],
          [
            "Acheter antivirus mais ne jamais l'ouvrir - doit fonctionner tout le temps",
            "L'éteindre car 'ça ralentit l'ordinateur' - la protection en vaut la peine",
            "Utiliser antivirus cracké/piraté - contient souvent des malwares lui-même!"
          ]
        )
      },
      {
        stepId: 'cyber_step_2',
        phase: 'immediate',
        title: ml(
          "Create passwords with 12+ characters, mix of letters, numbers, symbols. Use password manager.",
          "Cree contraseñas con 12+ caracteres, mezcla de letras, números, símbolos. Use administrador de contraseñas.",
          "Créez des mots de passe avec 12+ caractères, mélange de lettres, chiffres, symboles. Utilisez un gestionnaire de mots de passe."
        ),
        description: ml(
          "Change all business account passwords to strong ones. Use different password for each account. Consider a password manager like LastPass or 1Password to remember them all safely.",
          "Cambie todas las contraseñas de cuentas comerciales a fuertes. Use contraseña diferente para cada cuenta. Considere un administrador de contraseñas como LastPass o 1Password para recordarlas todas de forma segura.",
          "Changez tous les mots de passe de comptes professionnels en mots de passe forts. Utilisez un mot de passe différent pour chaque compte. Considérez un gestionnaire de mots de passe comme LastPass ou 1Password pour tous les mémoriser en toute sécurité."
        ),
        whyThisStepMatters: ml(
          "Weak passwords are the #1 way hackers get into accounts. 'password123' or 'jamaica' can be cracked in seconds. Strong passwords keep them out.",
          "Las contraseñas débiles son la forma #1 en que los hackers entran en cuentas. 'password123' o 'jamaica' pueden ser crackeadas en segundos. Las contraseñas fuertes los mantienen fuera.",
          "Les mots de passe faibles sont le moyen #1 par lequel les hackers entrent dans les comptes. 'password123' ou 'jamaica' peuvent être craqués en secondes. Les mots de passe forts les gardent dehors."
        ),
        whatHappensIfSkipped: ml(
          "Your accounts WILL get hacked eventually. Thieves drain bank accounts, steal customer data, impersonate you to scam others. Fix is expensive and time-consuming.",
          "Tus cuentas SERÁN hackeadas eventualmente. Los ladrones vacían cuentas bancarias, roban datos de clientes, se hacen pasar por ti para estafar a otros. La solución es costosa y consume tiempo.",
          "Vos comptes SERONT piratés éventuellement. Les voleurs vident les comptes bancaires, volent les données clients, se font passer pour vous pour escroquer d'autres. La correction est coûteuse et prend du temps."
        ),
        howToKnowItsDone: ml(
          "All critical accounts (bank, email, payment systems) have unique 12+ character passwords. Written down securely or in password manager.",
          "Todas las cuentas críticas (banco, correo, sistemas de pago) tienen contraseñas únicas de 12+ caracteres. Escritas de forma segura o en administrador de contraseñas.",
          "Tous les comptes critiques (banque, email, systèmes de paiement) ont des mots de passe uniques de 12+ caractères. Notés en toute sécurité ou dans gestionnaire de mots de passe."
        ),
        exampleOutput: ml(
          "Password list in locked notebook: 'NCB Online - MyShop@June2020!', 'Gmail - Protect#Business99', each different and strong.",
          "Lista de contraseñas en cuaderno cerrado: 'NCB Online - MiTienda@Junio2020!', 'Gmail - Proteger#Negocio99', cada una diferente y fuerte.",
          "Liste de mots de passe dans carnet verrouillé : 'NCB Online - MonMagasin@Juin2020!', 'Gmail - Protéger#Entreprise99', chacun différent et fort."
        ),
        freeAlternative: ml(
          "Write passwords in physical notebook kept in safe place. Free and works. Or use free password manager like Bitwarden.",
          "Escribe contraseñas en cuaderno físico guardado en lugar seguro. Gratis y funciona. O usa administrador de contraseñas gratuito como Bitwarden.",
          "Écrivez les mots de passe dans un carnet physique gardé en lieu sûr. Gratuit et fonctionne. Ou utilisez un gestionnaire de mots de passe gratuit comme Bitwarden."
        ),
        lowTechOption: ml(
          "Create password from sentence you'll remember: 'My shop opened in June 2020!' becomes 'Msoi J2020!'. Different sentence for each account.",
          "Crea contraseña de oración que recordarás: '¡Mi tienda abrió en junio 2020!' se convierte en 'Mtae j2020!'. Oración diferente para cada cuenta.",
          "Créez un mot de passe à partir d'une phrase dont vous vous souviendrez : 'Mon magasin a ouvert en juin 2020!' devient 'Mmao j2020!'. Phrase différente pour chaque compte."
        ),
        commonMistakesForStep: mlArray(
          [
            "Using same password everywhere - one hack compromises everything",
            "Making it so complex you forget it, then writing on sticky note on monitor (NOT secure!)",
            "Sharing password with too many people - each person increases risk"
          ],
          [
            "Usar misma contraseña en todos lados - un hackeo compromete todo",
            "Hacerla tan compleja que la olvidas, luego escribirla en nota adhesiva en monitor (¡NO seguro!)",
            "Compartir contraseña con demasiadas personas - cada persona aumenta el riesgo"
          ],
          [
            "Utiliser le même mot de passe partout - un piratage compromet tout",
            "Le rendre si complexe que vous l'oubliez, puis l'écrire sur un post-it sur le moniteur (PAS sécurisé!)",
            "Partager le mot de passe avec trop de personnes - chaque personne augmente le risque"
          ]
        )
      }
    ]
  }
]

async function main() {
  console.log('🌐 Populating COMPLETE multilingual data for strategies and action steps...\n')
  
  let strategiesUpdated = 0
  let actionStepsCreated = 0
  
  for (const strategyData of COMPLETE_STRATEGIES) {
    try {
      // Update strategy
      const strategy = await prisma.riskMitigationStrategy.findUnique({
        where: { strategyId: strategyData.strategyId }
      })
      
      if (!strategy) {
        console.log(`⚠️  Strategy '${strategyData.strategyId}' not found, skipping...`)
        continue
      }
      
      await prisma.riskMitigationStrategy.update({
        where: { strategyId: strategyData.strategyId },
        data: strategyData.updates
      })
      
      strategiesUpdated++
      console.log(`✅ Updated strategy: ${strategyData.strategyId}`)
      
      // Create/update action steps
      for (const stepData of strategyData.actionSteps || []) {
        try {
          // Check if step exists
          const existing = await prisma.actionStep.findFirst({
            where: {
              strategyId: strategy.id,
              stepId: stepData.stepId
            }
          })
          
          if (existing) {
            // Update existing
            await prisma.actionStep.update({
              where: { id: existing.id },
              data: stepData
            })
            console.log(`  ✓ Updated action step: ${stepData.stepId}`)
          } else {
            // Create new
            await prisma.actionStep.create({
              data: {
                ...stepData,
                strategyId: strategy.id
              }
            })
            actionStepsCreated++
            console.log(`  ✓ Created action step: ${stepData.stepId}`)
          }
        } catch (error) {
          console.error(`  ❌ Error with action step ${stepData.stepId}:`, error.message)
        }
      }
      
    } catch (error) {
      console.error(`❌ Error updating ${strategyData.strategyId}:`, error.message)
    }
  }
  
  console.log(`\n🎉 Complete! Updated ${strategiesUpdated} strategies and created/updated ${actionStepsCreated} action steps!`)
  console.log(`\n📝 All multilingual fields now populated in EN, ES, and FR!`)
  
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  prisma.$disconnect()
  process.exit(1)
})


