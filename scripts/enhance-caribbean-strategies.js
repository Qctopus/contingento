const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Caribbean-specific enhancements for SME strategies
const caribbeanEnhancements = {
  hurricane_preparation: {
    additionalTips: [
      {
        en: "Track hurricanes using local radio stations like Jamaica Broadcasting Corporation (JBC) or regional services like Caribbean Disaster Emergency Management Agency (CDEMA)",
        es: "Rastree huracanes usando estaciones de radio locales como Jamaica Broadcasting Corporation (JBC) o servicios regionales como la Agencia Caribeña de Gestión de Emergencias por Desastres (CDEMA)",
        fr: "Suivez les ouraganes en utilisant les stations de radio locales comme Jamaica Broadcasting Corporation (JBC) ou les services régionaux comme l'Agence caribéenne de gestion des urgences en cas de catastrophe (CDEMA)"
      },
      {
        en: "Source hurricane shutters locally from hardware stores like Rapid True Value, Loshusan, or local fabricators to save on shipping costs",
        es: "Compre persianas para huracanes localmente en ferreterías como Rapid True Value, Loshusan, o fabricantes locales para ahorrar en costos de envío",
        fr: "Achetez des volets anti-ouragan localement dans les quincailleries comme Rapid True Value, Loshusan, ou les fabricants locaux pour économiser sur les frais d'expédition"
      },
      {
        en: "Consider the 'June too soon, July stand by, August you must, September remember, October all over' Caribbean hurricane season timeline",
        es: "Considere el calendario de temporada de huracanes caribeños 'Junio muy pronto, Julio prepárate, Agosto debes, Septiembre recuerda, Octubre terminó'",
        fr: "Considérez le calendrier de la saison des ouragans des Caraïbes 'Juin trop tôt, Juillet préparez-vous, Août vous devez, Septembre souvenez-vous, Octobre c'est fini'"
      }
    ],
    actionSteps: [
      {
        phase: 'immediate',
        title: {
          en: "Conduct hurricane risk assessment for your specific Caribbean location",
          es: "Realizar evaluación de riesgo de huracanes para su ubicación específica en el Caribe",
          fr: "Effectuer une évaluation des risques d'ouragan pour votre emplacement spécifique dans les Caraïbes"
        },
        description: {
          en: "Research your parish/district's historical hurricane data from the Meteorological Service. Coastal businesses face storm surge risks, while inland locations may experience flooding and landslides. Document wind exposure, flood zones, and evacuation routes specific to your area.",
          es: "Investigue los datos históricos de huracanes de su parroquia/distrito del Servicio Meteorológico. Las empresas costeras enfrentan riesgos de marejada ciclónica, mientras que las ubicaciones interiores pueden experimentar inundaciones y deslizamientos de tierra. Documente la exposición al viento, las zonas de inundación y las rutas de evacuación específicas de su área.",
          fr: "Recherchez les données historiques sur les ouragans de votre paroisse/district auprès du Service météorologique. Les entreprises côtières font face à des risques d'onde de tempête, tandis que les emplacements intérieurs peuvent connaître des inondations et des glissements de terrain. Documentez l'exposition au vent, les zones inondables et les itinéraires d'évacuation spécifiques à votre région."
        },
        whyThisStepMatters: {
          en: "Caribbean hurricanes vary greatly by location - coastal Kingston faces different risks than Mandeville or Port Antonio",
          es: "Los huracanes caribeños varían mucho según la ubicación: Kingston costera enfrenta riesgos diferentes a Mandeville o Port Antonio",
          fr: "Les ouragans des Caraïbes varient considérablement selon l'emplacement - Kingston côtier fait face à des risques différents de Mandeville ou Port Antonio"
        }
      }
    ]
  },
  
  flood_prevention: {
    additionalTips: [
      {
        en: "Install French drains using locally-sourced gravel and perforated PVC pipes available at hardware stores - much cheaper than imported drainage systems",
        es: "Instale drenajes franceses usando grava de origen local y tubos de PVC perforados disponibles en ferreterías - mucho más barato que sistemas de drenaje importados",
        fr: "Installez des drains français en utilisant du gravier d'origine locale et des tuyaux en PVC perforés disponibles dans les quincailleries - beaucoup moins cher que les systèmes de drainage importés"
      },
      {
        en: "During rainy season (May-November), check drains weekly as tropical downpours can drop 4-6 inches of rain in hours",
        es: "Durante la temporada de lluvias (mayo-noviembre), revise los desagües semanalmente ya que los aguaceros tropicales pueden arrojar 4-6 pulgadas de lluvia en horas",
        fr: "Pendant la saison des pluies (mai-novembre), vérifiez les drains hebdomadairement car les averses tropicales peuvent déverser 4-6 pouces de pluie en quelques heures"
      }
    ]
  },

  backup_power: {
    additionalTips: [
      {
        en: "Partner with neighboring businesses to share generator costs - common in Caribbean business districts where JPS outages affect whole areas",
        es: "Asóciese con negocios vecinos para compartir costos de generador - común en distritos comerciales caribeños donde los apagones de JPS afectan áreas completas",
        fr: "Partenariat avec les entreprises voisines pour partager les coûts de générateur - courant dans les quartiers d'affaires des Caraïbes où les pannes de JPS affectent des zones entières"
      },
      {
        en: "Budget for diesel/petrol price fluctuations (JMD $150-200/L) - Caribbean fuel prices swing with global markets and local taxes",
        es: "Presupueste para fluctuaciones de precios de diesel/gasolina (JMD $150-200/L) - los precios de combustible caribeños oscilan con mercados globales e impuestos locales",
        fr: "Budgetisez les fluctuations des prix du diesel/essence (JMD $150-200/L) - les prix du carburant dans les Caraïbes fluctuent avec les marchés mondiaux et les taxes locales"
      },
      {
        en: "Consider solar + battery backup (companies like Everything Solar Jamaica offer SME packages) - reduces fuel dependency",
        es: "Considere respaldo solar + batería (empresas como Everything Solar Jamaica ofrecen paquetes para PYMES) - reduce dependencia de combustible",
        fr: "Envisagez une sauvegarde solaire + batterie (des entreprises comme Everything Solar Jamaica proposent des forfaits PME) - réduit la dépendance au carburant"
      }
    ]
  },

  cybersecurity_protection: {
    actionSteps: [
      {
        phase: 'immediate',
        title: {
          en: "Set up multi-factor authentication using Caribbean mobile networks",
          es: "Configurar autenticación multifactor usando redes móviles caribeñas",
          fr: "Configurer l'authentification multifacteur en utilisant les réseaux mobiles des Caraïbes"
        },
        description: {
          en: "Enable two-factor authentication (2FA) for all business accounts using SMS to local mobile numbers (Digicel/Flow) or apps like Google Authenticator. This protects against password theft which is common in Caribbean cybercrime. Set up on email, banking, social media, and Point of Sale systems.",
          es: "Habilite autenticación de dos factores (2FA) para todas las cuentas comerciales usando SMS a números móviles locales (Digicel/Flow) o aplicaciones como Google Authenticator. Esto protege contra robo de contraseñas que es común en el cibercrimen caribeño. Configure en correo electrónico, banca, redes sociales y sistemas punto de venta.",
          fr: "Activez l'authentification à deux facteurs (2FA) pour tous les comptes professionnels en utilisant SMS vers des numéros mobiles locaux (Digicel/Flow) ou des applications comme Google Authenticator. Cela protège contre le vol de mot de passe qui est courant dans la cybercriminalité des Caraïbes. Configurez sur l'email, la banque, les réseaux sociaux et les systèmes de point de vente."
        }
      }
    ],
    additionalTips: [
      {
        en: "Beware of lottery scams targeting Caribbean businesses - never pay fees to claim prizes, legitimate lotteries don't require upfront payment",
        es: "Tenga cuidado con estafas de lotería dirigidas a negocios caribeños - nunca pague tarifas para reclamar premios, loterías legítimas no requieren pago por adelantado",
        fr: "Méfiez-vous des escroqueries de loterie ciblant les entreprises des Caraïbes - ne payez jamais de frais pour réclamer des prix, les loteries légitimes ne nécessitent pas de paiement initial"
      },
      {
        en: "Protect customer data under Jamaica's Data Protection Act (2020) - fines up to JMD $2 million for breaches",
        es: "Proteja los datos de clientes bajo la Ley de Protección de Datos de Jamaica (2020) - multas de hasta JMD $2 millones por violaciones",
        fr: "Protégez les données des clients en vertu de la Loi sur la protection des données de la Jamaïque (2020) - amendes jusqu'à JMD $2 millions pour violations"
      }
    ]
  },

  supply_chain_diversification: {
    additionalTips: [
      {
        en: "Source from both local suppliers (support SMEs) and regional CARICOM partners to reduce import dependency and shipping delays",
        es: "Abastézcase tanto de proveedores locales (apoye a las PYMES) como de socios regionales de CARICOM para reducir dependencia de importación y retrasos de envío",
        fr: "Approvisionnez-vous auprès de fournisseurs locaux (soutenez les PME) et de partenaires régionaux de la CARICOM pour réduire la dépendance aux importations et les retards d'expédition"
      },
      {
        en: "Account for port delays at Kingston Harbour - have 30-day buffer stock for critical items during peak shipping seasons",
        es: "Tenga en cuenta retrasos portuarios en el Puerto de Kingston - mantenga inventario de 30 días para artículos críticos durante temporadas pico de envío",
        fr: "Tenez compte des retards portuaires au port de Kingston - ayez un stock tampon de 30 jours pour les articles critiques pendant les saisons de pointe d'expédition"
      },
      {
        en: "Join Caribbean business cooperatives or chambers of commerce for bulk purchasing power - reduces costs for imported goods",
        es: "Únase a cooperativas comerciales caribeñas o cámaras de comercio para poder de compra al por mayor - reduce costos de bienes importados",
        fr: "Rejoignez des coopératives commerciales des Caraïbes ou des chambres de commerce pour le pouvoir d'achat en gros - réduit les coûts des produits importés"
      }
    ]
  },

  financial_resilience: {
    additionalTips: [
      {
        en: "Open accounts with multiple Caribbean banks (NCB, Scotiabank, FirstCaribbean) - if one has system issues, you can still access funds",
        es: "Abra cuentas con múltiples bancos caribeños (NCB, Scotiabank, FirstCaribbean) - si uno tiene problemas de sistema, aún puede acceder a fondos",
        fr: "Ouvrez des comptes auprès de plusieurs banques des Caraïbes (NCB, Scotiabank, FirstCaribbean) - si l'une a des problèmes de système, vous pouvez toujours accéder aux fonds"
      },
      {
        en: "Save 6 months operating costs in JMD - Caribbean economic volatility (inflation, exchange rates) requires larger buffers than developed markets",
        es: "Ahorre 6 meses de costos operativos en JMD - la volatilidad económica caribeña (inflación, tasas de cambio) requiere mayores reservas que mercados desarrollados",
        fr: "Économisez 6 mois de coûts opérationnels en JMD - la volatilité économique des Caraïbes (inflation, taux de change) nécessite des réserves plus importantes que les marchés développés"
      },
      {
        en: "Access SME support from Development Bank of Jamaica, EXIM Bank Jamaica, or microfinance institutions like JBDC for low-interest crisis loans",
        es: "Acceda a apoyo para PYMES del Banco de Desarrollo de Jamaica, EXIM Bank Jamaica, o instituciones de microfinanzas como JBDC para préstamos de crisis a bajo interés",
        fr: "Accédez au soutien aux PME de la Development Bank of Jamaica, EXIM Bank Jamaica, ou des institutions de microfinance comme JBDC pour des prêts de crise à faible intérêt"
      }
    ]
  }
};

async function enhanceStrategies() {
  try {
    console.log('\n🌴 CARIBBEAN SME STRATEGY ENHANCEMENT\n');
    console.log('='.repeat(80));

    for (const [strategyId, enhancements] of Object.entries(caribbeanEnhancements)) {
      const strategy = await prisma.riskMitigationStrategy.findFirst({
        where: { strategyId },
        include: { actionSteps: true }
      });

      if (!strategy) {
        console.log(`⚠️  Strategy not found: ${strategyId}`);
        continue;
      }

      console.log(`\n📋 Enhancing: ${strategyId}`);

      // Update helpful tips
      if (enhancements.additionalTips) {
        const existingTips = strategy.helpfulTips ? 
          (typeof strategy.helpfulTips === 'string' ? JSON.parse(strategy.helpfulTips) : strategy.helpfulTips) : 
          { en: [], es: [], fr: [] };
        
        // Add new tips
        enhancements.additionalTips.forEach(tip => {
          if (!existingTips.en) existingTips.en = [];
          if (!existingTips.es) existingTips.es = [];
          if (!existingTips.fr) existingTips.fr = [];
          
          if (!existingTips.en.includes(tip.en)) {
            existingTips.en.push(tip.en);
            existingTips.es.push(tip.es);
            existingTips.fr.push(tip.fr);
          }
        });

        await prisma.riskMitigationStrategy.update({
          where: { id: strategy.id },
          data: {
            helpfulTips: JSON.stringify(existingTips)
          }
        });

        console.log(`   ✅ Added ${enhancements.additionalTips.length} Caribbean-specific tips`);
      }

      // Add action steps
      if (enhancements.actionSteps && strategy.actionSteps.length < 3) {
        for (const stepData of enhancements.actionSteps) {
          await prisma.actionStep.create({
            data: {
              strategyId: strategy.id,
              stepId: `${strategyId}_caribbean_${Date.now()}`,
              phase: stepData.phase,
              title: JSON.stringify(stepData.title),
              description: JSON.stringify(stepData.description),
              whyThisStepMatters: stepData.whyThisStepMatters ? JSON.stringify(stepData.whyThisStepMatters) : null,
              timeframe: '1-2 weeks',
              estimatedMinutes: 120,
              difficultyLevel: 'medium',
              responsibility: 'Business Owner',
              sortOrder: strategy.actionSteps.length + 1,
              isActive: true
            }
          });
        }

        console.log(`   ✅ Added ${enhancements.actionSteps.length} Caribbean-focused action steps`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Caribbean enhancement complete!\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enhanceStrategies();


