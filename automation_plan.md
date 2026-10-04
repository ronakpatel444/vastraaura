# 🚀 Vastra Aura Omnichannel AI Automation Plan

## 🧠 The "Heavy Brain" (AI Decision Engine)
This is the core intelligence of the system. It doesn't just run ads; it **learns and optimizes**.

### 1. Data Analysis & Feedback Loop
- **Daily Performance Check:** The Brain pulls data from Meta Ads API (Spend, CTR, CPC, Purchases).
- **Rule Engine:** 
  - *Condition:* IF Ad Spend >= ₹300 AND Sales == 0 
  - *Action:* PAUSE current Ad Set.
- **Dynamic Pivoting:** 
  - The Brain will maintain a list of target audiences (e.g., Target A: "Ethnic Wear", Target B: "Myntra/Nykaa Fashion", Target C: "Sabyasachi/Designer Fans"). 
  - If Target A fails, it automatically shifts the audience targeting to Target B the next day.

### 2. Auto-Curation (Product Selection)
- Out of 6-7 daily WhatsApp products, the Brain selects the 1 with the highest expected engagement (based on keywords, image brightness, or trend data) for the Post/Ad.
- The rest go to Instagram Stories.

---

## 🛠️ Implementation Phases

### Phase 1: WhatsApp Ingestion (Data Entry Automation)
- **Goal:** Read incoming messages from specific WhatsApp groups.
- **Action:** Download image, extract Fabric/Price/Details, set `stock = 10`.
- **Output:** Auto-create product in MongoDB for the Seller/Admin.

### Phase 2: Social Media Auto-Poster (Meta Graph API)
- **Goal:** Keep the social pages active without manual work.
- **Action:** Push the top 2 products as Posts (Facebook + Instagram).
- **Action:** Push remaining products as Stories.

### Phase 3: Meta Ads Manager API (The Marketer)
- **Goal:** Drive sales with a daily ₹200-₹300 budget.
- **Action:** Create Campaigns, Ad Sets, and Ads via code.
- **Action:** Apply the "Heavy Brain" logic to monitor ROAS (Return on Ad Spend) and automatically shift budgets to winning audiences.

## 🔑 Requirements Checklist from User
To make this live, we will need:
1. [ ] **WhatsApp Scan:** Scan QR code on the server terminal when we build Phase 1.
2. [ ] **Meta Developer Account:** Generate a `Graph API Access Token` (connected to Vastra Aura FB Page & Insta).
3. [ ] **Meta Ad Account ID:** So the script can create ads and read performance data.
