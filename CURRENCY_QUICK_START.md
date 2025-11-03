# Currency Management System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Access the Currency Management Tab

1. Navigate to `/admin2` in your browser
2. Click on the **💰 Currency & Costs** tab in the top navigation

You'll see three sub-tabs:
- 📦 **Cost Items Library** - Define reusable cost items
- 🌍 **Country Multipliers** - Adjust for local market conditions
- 💱 **Exchange Rates** - Manage currency conversions

---

### Step 2: Review Pre-Loaded Cost Items

The system comes with **10 default cost items** already loaded:

✅ **Construction Items:**
- Hurricane Shutters (Standard) - $450 USD
- Plywood Boards - $90 USD

✅ **Equipment:**
- Backup Generator (5kW) - $2,800 USD
- Water Storage Tank (200L) - $180 USD
- Fire Extinguisher - $45 USD

✅ **Services:**
- Professional Installation - $200 USD
- Cloud Backup System (Annual) - $240 USD

✅ **Supplies:**
- Generator Fuel (50L) - $100 USD
- Emergency Food (2 weeks) - $300 USD
- Commercial First Aid Kit - $85 USD

These items are immediately available for use!

---

### Step 3: Add Countries (Required First Step)

**Important:** Country multipliers auto-sync from Location Management.

1. Go to **Location Risks** tab in Admin2
2. Add your target countries:
   - Jamaica (JM)
   - Haiti (HT)
   - Bahamas (BS)
   - Dominican Republic (DO)
   - Trinidad & Tobago (TT)
   - Barbados (BB)
   - Or any other Caribbean countries

3. Return to **Currency & Costs** tab
4. Go to **Country Multipliers** sub-tab
5. Countries will now appear automatically!

---

### Step 4: Configure Country Multipliers

Click **Edit** for each country and adjust multipliers:

**What do multipliers mean?**
- **1.00** = Same cost as USD
- **0.70** = 30% cheaper (lower labor costs)
- **1.40** = 40% more expensive (import duties, island premiums)

**Recommended starting values (from seed data):**

**Jamaica (JM)** - Baseline
- Construction: 1.00
- Equipment: 1.00
- Service: 1.00
- Supplies: 1.00

**Haiti (HT)** - Cheaper labor, expensive equipment
- Construction: 0.70
- Equipment: 1.15
- Service: 0.50
- Supplies: 0.85

**Bahamas (BS)** - Island premium
- Construction: 1.45
- Equipment: 1.30
- Service: 1.65
- Supplies: 1.25

**Dominican Republic (DO)** - Moderate costs
- Construction: 0.75
- Equipment: 0.95
- Service: 0.65
- Supplies: 0.90

---

### Step 5: Set Exchange Rates

Go to **Exchange Rates** sub-tab and click **Edit** for each country:

**Recommended rates (as of Jan 2025):**
- Jamaica: 1 USD = 157.50 JMD
- Haiti: 1 USD = 132.00 HTG
- Bahamas: 1 USD = 1.00 BSD
- Dominican Republic: 1 USD = 58.50 DOP
- Trinidad & Tobago: 1 USD = 6.80 TTD
- Barbados: 1 USD = 2.00 BBD

**Pro tip:** Update these monthly for accuracy!

---

### Step 6: Test the System

Let's calculate a cost example:

**Hurricane Shutters in Haiti:**
1. Base Price: $450 USD
2. Category: Construction
3. Haiti Construction Multiplier: 0.70
4. Haiti Exchange Rate: 132 HTG/USD

**Calculation:**
```
Local Cost = $450 × 0.70 × 132 HTG/USD
Local Cost = G 41,580 HTG per window
```

The system does this automatically! 🎉

---

### Step 7: Create Your Own Cost Items

Need to add more items? Easy!

1. Go to **Cost Items Library** tab
2. Click **+ Add New Item**
3. Fill in the form:
   - **Item ID:** unique_identifier (e.g., `solar_panels`)
   - **Name:** Display name (e.g., `Solar Panels 500W`)
   - **Description:** Brief description
   - **Category:** construction/equipment/service/supplies
   - **Base Price (USD):** e.g., $1200
   - **Optional:** Min/Max prices, unit, tags
4. Click **Save Item**

Done! Your item is now available in all countries with automatic cost calculation.

---

## 📋 Typical Workflow

```
1. Add countries in Location Management
         ↓
2. Configure multipliers (Currency tab)
         ↓
3. Set exchange rates (Currency tab)
         ↓
4. Create/review cost items (Currency tab)
         ↓
5. Link items to strategies (Strategies tab - future)
         ↓
6. Users see costs in local currency automatically!
```

---

## 💡 Pro Tips

### For Accurate Multipliers

**Construction:**
- Consider: Local labor rates, building material availability
- Higher in islands with import dependencies
- Lower in countries with strong local construction industry

**Equipment:**
- Consider: Import duties, shipping costs, local availability
- Higher for specialized/imported equipment
- Lower if locally manufactured alternatives exist

**Services:**
- Consider: Professional service rates, licensing requirements
- Often cheaper in developing countries
- More expensive in tourism-heavy economies

**Supplies:**
- Consider: Import costs, local production, perishability
- Higher for islands relying on imports
- Lower for locally produced goods

### For Exchange Rates

1. **Use mid-market rates** (average of buy/sell)
2. **Update monthly minimum**
3. **Document your source:**
   - Central bank websites
   - exchangerate-api.com
   - oanda.com
   - xe.com
4. **Set confidence levels:**
   - High: Stable currency, official source
   - Medium: Moderate volatility
   - Low: High volatility or estimated

---

## 🎯 Next Steps

Once you're comfortable with the basics:

1. **Link items to strategies** (coming soon in Strategies tab)
2. **Set up budget alternatives** (link cheaper options to expensive items)
3. **Add manual overrides** for verified local costs
4. **Export/import** cost data for offline editing
5. **Integrate currency API** for auto-updates

---

## 🆘 Troubleshooting

**Q: Why don't I see any countries in Country Multipliers?**  
A: Add countries first in the Location Risks tab. They auto-sync to Currency Management.

**Q: Can I delete a cost item?**  
A: Yes, but only if it's not linked to any strategies. Otherwise, unlink it first.

**Q: What if a country's costs vary widely by region?**  
A: Start with a national average. Later, you can add manual overrides per strategy.

**Q: How do I handle multiple currencies in one country?**  
A: Use the most common local currency. USD/EUR acceptability can be noted in strategy descriptions.

**Q: Exchange rates change frequently. How often should I update?**  
A: Monthly minimum. Weekly for volatile currencies. Daily for critical applications.

---

## 📞 Support

- **Full Documentation:** See `CURRENCY_SYSTEM_IMPLEMENTATION.md`
- **Seed Script:** Run `npx tsx prisma/seeds/currencyData.ts` to reset data
- **Database Schema:** Check `prisma/schema.prisma` lines 813-926

---

## ✅ Quick Checklist

- [ ] Access Currency & Costs tab in Admin2
- [ ] Add countries in Location Risks tab
- [ ] Configure country multipliers
- [ ] Set exchange rates
- [ ] Review default cost items (10 pre-loaded)
- [ ] Create custom cost items as needed
- [ ] Test calculations with sample items
- [ ] Document data sources for audit
- [ ] Set update reminder (monthly for rates)

---

**You're all set!** The currency management system is ready to help businesses across the Caribbean prepare for disasters with accurate, localized cost estimates. 🌍💰

Happy cost managing! 🎉

