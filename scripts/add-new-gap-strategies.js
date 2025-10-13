const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Helper functions
function toMultilingual(en, es, fr) {
  return JSON.stringify({ en, es, fr })
}

function toJSON(array) {
  return JSON.stringify(array)
}

const NEW_STRATEGIES = [
  {
    strategyId: 'communication_backup',
    name: toMultilingual(
      "Communication Backup Systems",
      "Sistemas de Respaldo de Comunicación",
      "Systèmes de Communication de Secours"
    ),
    description: toMultilingual(
      "Ensure business communication continuity when primary systems fail through backup phones, internet, and emergency contact protocols",
      "Asegura la continuidad de comunicación del negocio cuando fallan los sistemas primarios a través de teléfonos de respaldo, internet y protocolos de contacto de emergencia",
      "Assurez la continuité des communications d'entreprise lorsque les systèmes principaux tombent en panne grâce aux téléphones de secours, à Internet et aux protocoles de contact d'urgence"
    ),
    category: "resilience",
    
    // SME Content
    smeTitle: toMultilingual(
      "Stay Connected to Customers When Phone/Internet Goes Down",
      "Mantente Conectado con Clientes Cuando Se Cae el Teléfono/Internet",
      "Restez Connecté aux Clients Quand Téléphone/Internet Tombe"
    ),
    smeSummary: toMultilingual(
      "In today's business, losing phone or internet means losing customers. Having backup communication means you can still take orders, answer questions, and stay in business when others can't reach their customers.",
      "En el negocio actual, perder teléfono o internet significa perder clientes. Tener comunicación de respaldo significa que aún puedes tomar pedidos, responder preguntas y seguir en el negocio cuando otros no pueden contactar a sus clientes.",
      "Dans les affaires d'aujourd'hui, perdre le téléphone ou Internet signifie perdre des clients. Avoir une communication de secours signifie que vous pouvez encore prendre des commandes, répondre aux questions et rester en affaires quand d'autres ne peuvent pas joindre leurs clients."
    ),
    benefitsBullets: toJSON([
      "Keep taking orders during outages",
      "Customers can still reach you",
      "Coordinate with suppliers and staff",
      "Process payments even without main system"
    ]),
    realWorldExample: toMultilingual(
      "During Tropical Storm in 2022, a delivery service in Kingston lost their main phone line for 3 days. They had backup cell phones (JMD 8,000 each) and posted the numbers on social media. While competitors went silent, they kept taking orders and made JMD 220,000 during the outage.",
      "Durante la Tormenta Tropical en 2022, un servicio de entregas en Kingston perdió su línea telefónica principal por 3 días. Tenían teléfonos celulares de respaldo (JMD 8,000 cada uno) y publicaron los números en redes sociales. Mientras los competidores quedaron en silencio, siguieron tomando pedidos y ganaron JMD 220,000 durante el apagón.",
      "Pendant la tempête tropicale de 2022, un service de livraison à Kingston a perdu sa ligne téléphonique principale pendant 3 jours. Ils avaient des téléphones portables de secours (8 000 JMD chacun) et ont publié les numéros sur les réseaux sociaux. Alors que les concurrents sont restés silencieux, ils ont continué à prendre des commandes et ont gagné 220 000 JMD pendant la panne."
    ),
    
    implementationCost: "Low",
    costEstimateJMD: "JMD 8,000-40,000",
    timeToImplement: "1-2 days",
    estimatedTotalHours: 3,
    effectiveness: 8,
    complexityLevel: "simple",
    quickWinIndicator: true,
    
    defaultSelected: false,
    selectionTier: "recommended",
    requiredForRisks: toJSON(["communication_failure", "hurricane", "power_outage"]),
    
    lowBudgetAlternative: toMultilingual(
      "Basic prepaid phone (JMD 4,000-6,000) with credit, WhatsApp Business (free), neighbors' WiFi backup arrangement (ask nicely!). Total: under JMD 10,000.",
      "Teléfono prepago básico (JMD 4,000-6,000) con crédito, WhatsApp Business (gratis), arreglo de respaldo WiFi con vecinos (¡pide amablemente!). Total: menos de JMD 10,000.",
      "Téléphone prépayé de base (4 000-6 000 JMD) avec crédit, WhatsApp Business (gratuit), arrangement de secours WiFi avec les voisins (demandez gentiment !). Total : moins de 10 000 JMD."
    ),
    diyApproach: toMultilingual(
      "1) Buy cheap prepaid phone for emergencies (JMD 5,000). 2) Set up WhatsApp Business on it (free). 3) Post emergency contact numbers on Facebook/Instagram. 4) Make list of all customer/supplier numbers and print it. 5) Arrange to use neighbor's WiFi in emergency (return the favor). Total: JMD 5,000-8,000.",
      "1) Compra teléfono prepago barato para emergencias (JMD 5,000). 2) Configura WhatsApp Business en él (gratis). 3) Publica números de contacto de emergencia en Facebook/Instagram. 4) Haz lista de todos los números de clientes/proveedores e imprímela. 5) Arregla usar WiFi del vecino en emergencia (devuelve el favor). Total: JMD 5,000-8,000.",
      "1) Achetez un téléphone prépayé bon marché pour les urgences (5 000 JMD). 2) Configurez WhatsApp Business dessus (gratuit). 3) Publiez les numéros de contact d'urgence sur Facebook/Instagram. 4) Faites une liste de tous les numéros clients/fournisseurs et imprimez-la. 5) Arrangez-vous pour utiliser le WiFi du voisin en cas d'urgence (rendez la pareille). Total : 5 000-8 000 JMD."
    ),
    estimatedDIYSavings: "JMD 30,000-50,000 vs business phone systems",
    
    bcpSectionMapping: "communication_backup",
    bcpTemplateText: "Communication Backup:\n✓ Backup phone numbers posted publicly\n✓ WhatsApp Business configured\n✓ Printed contact lists (customers, suppliers, staff)\n✓ Alternative internet access arranged\n✓ Social media emergency posting plan",
    
    industryVariants: toJSON({
      "restaurant": "Critical for delivery orders. Keep backup phone charged. Train delivery staff on using WhatsApp for orders.",
      "retail": "Customers need to reach you for availability/hours. Post backup numbers on storefront and social media.",
      "services": "Appointments depend on communication. SMS/WhatsApp backup essential. Email alternative if internet down.",
      "tourism": "Guest communication critical. Multiple contact methods (WhatsApp, SMS, email, messenger). Backup for bookings."
    }),
    businessSizeGuidance: toJSON({
      "micro": "One backup prepaid phone (JMD 5,000) and WhatsApp. Keep charged. Post number publicly.",
      "small": "2-3 backup phones for key staff. Backup internet via mobile hotspot. JMD 15,000-25,000.",
      "medium": "Dedicated backup communication system. Multiple carriers. Mobile hotspots. JMD 50,000+"
    }),
    
    helpfulTips: toJSON([
      "Keep backup phone charged even when not using it - emergency won't wait",
      "Post backup numbers where customers can see - on door, social media, Google Business",
      "Test your backup system quarterly - make sure it works before you need it",
      "Have contact lists printed - can't access phone contacts if phone/internet down"
    ]),
    commonMistakes: toJSON([
      "Backup phone never charged - dead when you need it",
      "Nobody knows the backup number - customers can't reach you",
      "All phones on same carrier - if carrier goes down, all phones down",
      "No printed contact lists - can't reach anyone without your phone"
    ]),
    successMetrics: toJSON([
      "Backup communication tested monthly",
      "Backup numbers posted in 3+ places (door, social media, etc.)",
      "Printed contact lists updated and accessible",
      "Can communicate with customers/suppliers within 15 minutes of primary system failure"
    ]),
    
    applicableRisks: toJSON(["communication_failure", "power_outage", "hurricane", "equipment_failure"]),
    applicableBusinessTypes: toJSON(["all"]),
    isActive: true
  },
  
  {
    strategyId: 'equipment_maintenance',
    name: toMultilingual(
      "Critical Equipment Maintenance & Backup",
      "Mantenimiento y Respaldo de Equipo Crítico",
      "Maintenance et Sauvegarde d'Équipement Critique"
    ),
    description: toMultilingual(
      "Preventive maintenance and backup plans for equipment essential to business operations",
      "Mantenimiento preventivo y planes de respaldo para equipos esenciales para las operaciones del negocio",
      "Maintenance préventive et plans de secours pour l'équipement essentiel aux opérations commerciales"
    ),
    category: "resilience",
    
    // SME Content
    smeTitle: toMultilingual(
      "Keep Your Critical Equipment Working (And Know What to Do When It Breaks)",
      "Mantén Tu Equipo Crítico Funcionando (Y Sabe Qué Hacer Cuando Se Rompe)",
      "Gardez Votre Équipement Critique en Marche (Et Sachez Quoi Faire Quand Il Casse)"
    ),
    smeSummary: toMultilingual(
      "Every business has equipment that if it breaks, you can't operate - fridge, POS system, vehicle, machinery. Regular maintenance prevents expensive breakdowns, and having a backup plan keeps you in business when things fail.",
      "Cada negocio tiene equipo que si se rompe, no puedes operar - nevera, sistema POS, vehículo, maquinaria. El mantenimiento regular previene averías costosas, y tener un plan de respaldo te mantiene en el negocio cuando las cosas fallan.",
      "Chaque entreprise a un équipement qui, s'il se casse, vous ne pouvez pas opérer - réfrigérateur, système POS, véhicule, machinerie. La maintenance régulière prévient les pannes coûteuses, et avoir un plan de secours vous garde en affaires quand les choses échouent."
    ),
    benefitsBullets: toJSON([
      "Prevent expensive emergency repairs",
      "Avoid losing days of business to breakdown",
      "Extend equipment lifespan by years",
      "Have backup ready when critical equipment fails"
    ]),
    realWorldExample: toMultilingual(
      "A restaurant in Ocho Rios ignored their walk-in freezer maintenance. It broke on a Friday afternoon - lost JMD 150,000 in spoiled food and closed for weekend waiting for repair (JMD 85,000 emergency service + lost revenue JMD 200,000 = JMD 285,000 total loss). Regular maintenance would have cost JMD 15,000/year.",
      "Un restaurante en Ocho Rios ignoró el mantenimiento de su congelador. Se rompió un viernes por la tarde - perdió JMD 150,000 en comida deteriorada y cerró el fin de semana esperando reparación (servicio de emergencia JMD 85,000 + ingresos perdidos JMD 200,000 = pérdida total JMD 285,000). El mantenimiento regular hubiera costado JMD 15,000/año.",
      "Un restaurant à Ocho Rios a ignoré l'entretien de son congélateur. Il est tombé en panne un vendredi après-midi - a perdu 150 000 JMD en nourriture gâtée et fermé le week-end en attendant la réparation (service d'urgence 85 000 JMD + revenus perdus 200 000 JMD = perte totale 285 000 JMD). L'entretien régulier aurait coûté 15 000 JMD/an."
    ),
    
    implementationCost: "Low to Moderate",
    costEstimateJMD: "JMD 10,000-80,000/year",
    timeToImplement: "Ongoing",
    estimatedTotalHours: 2,
    effectiveness: 9,
    complexityLevel: "simple",
    quickWinIndicator: true,
    
    defaultSelected: false,
    selectionTier: "recommended",
    requiredForRisks: toJSON(["equipment_failure"]),
    
    lowBudgetAlternative: toMultilingual(
      "DIY maintenance: Clean filters monthly (free), check connections (free), keep maintenance log in notebook (JMD 500). Know a good repair technician before you need one (get number now!). Total: under JMD 1,000.",
      "Mantenimiento casero: Limpia filtros mensualmente (gratis), revisa conexiones (gratis), mantén registro de mantenimiento en cuaderno (JMD 500). Conoce un buen técnico de reparación antes de necesitarlo (¡consigue el número ahora!). Total: menos de JMD 1,000.",
      "Maintenance DIY : Nettoyez les filtres mensuellement (gratuit), vérifiez les connexions (gratuit), gardez un journal de maintenance dans un carnet (500 JMD). Connaissez un bon technicien de réparation avant d'en avoir besoin (obtenez le numéro maintenant !). Total : moins de 1 000 JMD."
    ),
    diyApproach: toMultilingual(
      "1) List your 3-5 most critical equipment pieces. 2) Read the manual (yes, really!) for maintenance requirements. 3) Create simple maintenance schedule. 4) Do what you can yourself (cleaning, basic checks). 5) Find reliable technician for annual service. 6) Identify rental options if equipment breaks. Cost: Time + basic service fees.",
      "1) Enumera tus 3-5 piezas de equipo más críticas. 2) Lee el manual (¡sí, en serio!) para requisitos de mantenimiento. 3) Crea calendario simple de mantenimiento. 4) Haz lo que puedas tú mismo (limpieza, revisiones básicas). 5) Encuentra técnico confiable para servicio anual. 6) Identifica opciones de alquiler si el equipo se rompe. Costo: Tiempo + tarifas básicas de servicio.",
      "1) Listez vos 3-5 pièces d'équipement les plus critiques. 2) Lisez le manuel (oui, vraiment !) pour les exigences de maintenance. 3) Créez un calendrier de maintenance simple. 4) Faites ce que vous pouvez vous-même (nettoyage, vérifications de base). 5) Trouvez un technicien fiable pour le service annuel. 6) Identifiez les options de location si l'équipement casse. Coût : Temps + frais de service de base."
    ),
    estimatedDIYSavings: "JMD 50,000-100,000/year in prevented breakdown costs",
    
    bcpSectionMapping: "equipment_backup",
    bcpTemplateText: "Equipment Maintenance:\n✓ Critical equipment list (top 5 items)\n✓ Maintenance schedule created and followed\n✓ Reliable technician contact info\n✓ Backup/rental options identified\n✓ Equipment manuals accessible\n✓ Maintenance log kept",
    
    industryVariants: toJSON({
      "restaurant": "CRITICAL: Refrigeration, cooking equipment, dishwasher. Breakdown means food spoilage or closure. Have rental fridge contact ready.",
      "retail": "POS system, AC (customers won't shop in heat), security system. Keep backup payment method (manual card machine).",
      "services": "Depends on service - salon needs water heater, mechanic needs tools/lifts, office needs computers. Know rental options.",
      "manufacturing": "Production machinery. Downtime = no revenue. Preventive maintenance is cheaper than emergency repairs and lost production."
    }),
    businessSizeGuidance: toJSON({
      "micro": "Focus on top 2-3 critical items. DIY basic maintenance. Find good repair person. JMD 10,000-20,000/year.",
      "small": "Maintenance contracts for critical equipment. Backup plans in place. JMD 30,000-60,000/year.",
      "medium": "Comprehensive maintenance program. Spare parts inventory. Backup equipment. JMD 100,000+/year."
    }),
    
    helpfulTips: toJSON([
      "Read the equipment manual - it tells you exactly what maintenance is needed",
      "Small maintenance now prevents big repairs later - JMD 10,000 maintenance vs JMD 100,000 replacement",
      "Know a repair technician BEFORE you need one - emergency calls cost 2-3x more",
      "For critical equipment (fridge, freezer), have rental company number ready"
    ]),
    commonMistakes: toJSON([
      "Ignoring small problems until they become big expensive ones",
      "Never cleaning filters/coils - makes equipment work harder and fail faster",
      "No relationship with repair technician - emergency service costs much more",
      "Running equipment 24/7 without service - it will fail at worst possible time",
      "No backup plan - one broken fridge closes the whole restaurant"
    ]),
    successMetrics: toJSON([
      "Critical equipment identified and prioritized",
      "Maintenance performed on schedule",
      "Backup/rental options identified and contacts saved",
      "Zero unexpected equipment failures in last 6 months"
    ]),
    
    applicableRisks: toJSON(["equipment_failure", "business_disruption"]),
    applicableBusinessTypes: toJSON(["all"]),
    isActive: true
  }
]

async function main() {
  console.log('🔧 Adding new strategies for uncovered risks...\n')
  
  let created = 0
  
  for (const strategy of NEW_STRATEGIES) {
    try {
      // Check if already exists
      const existing = await prisma.riskMitigationStrategy.findUnique({
        where: { strategyId: strategy.strategyId }
      })
      
      if (existing) {
        console.log(`⚠️  Strategy '${strategy.strategyId}' already exists, skipping...`)
        continue
      }
      
      await prisma.riskMitigationStrategy.create({
        data: strategy
      })
      
      created++
      const name = JSON.parse(strategy.name).en
      console.log(`✅ Created: ${strategy.strategyId} - ${name}`)
      
    } catch (error) {
      console.error(`❌ Error creating ${strategy.strategyId}:`, error.message)
    }
  }
  
  console.log(`\n🎉 Successfully created ${created} new strategies!`)
  console.log(`📊 Total strategies now: ${11 + created}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)

