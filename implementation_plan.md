# Goal Description

Implement a "Combo Offer" feature (2 Lehengas for ₹2,999) mirroring the Mudra Ethnic combo section. This involves scraping a new collection, building a specialized UI for combo products, and updating the cart logic to apply the ₹2,999 bulk discount when exactly two (or multiples of two) combo items are added.

## Proposed Changes

### 1. Data Collection & Scraping
- Scrape `https://mudraethnic.com/collections/combo-lehengas` with the category set to `"Combo Lehengas"`. This will allow us to identify which products are eligible for the combo discount.

### 2. Frontend UI - Combo Page
#### [NEW] [src/app/combo/page.tsx](file:///d:/Ronak%20flutter/site/src/app/combo/page.tsx)
- Create a dedicated Combo page (e.g. `/combo`).
- Add a header banner displaying the offer: "2 Lehengas → ₹2,999" and "Only ₹2999 for 2".
- Fetch products with the category `"Combo Lehengas"`.
- Render a grid of specialized product cards containing:
  - An "ADD PRODUCT TO COMBO" button alongside a quantity `[- 1 +]` selector directly on the card, as shown in the screenshot.

### 3. Cart Logic Updates
#### [MODIFY] [src/store/useStore.ts](file:///d:/Ronak%20flutter/site/src/store/useStore.ts)
- Update the cart state or total calculation logic to apply the combo discount.
- Logic: For every 2 products in the cart that have the category `"Combo Lehengas"`, their combined price will be set to ₹2,999 (discount applied at the cart level). Any unpaired combo product will remain at its normal price.

#### [MODIFY] [src/app/cart/page.tsx](file:///d:/Ronak%20flutter/site/src/app/cart/page.tsx) (if applicable)
- Display a message in the cart indicating that the combo discount has been applied, so the user sees the savings clearly.

## User Review Required

> [!IMPORTANT]  
> 1. Where do you want this Combo section to be visible? Should it be a separate page like `/combo`, or do you want it displayed directly on the Homepage?
> 2. For the combo pricing: if someone buys 3 combo lehengas, should 2 be priced at ₹2,999 and the 3rd one at its normal individual price? (This is standard practice, please confirm).

## Verification Plan

1. Run the scraper for the combo collection.
2. Build the UI and navigate to the combo page to verify the design matches the rich aesthetics expected.
3. Test adding 1, 2, and 3 combo items to the cart and verify that the cart total correctly applies the ₹2,999 discount for pairs.
